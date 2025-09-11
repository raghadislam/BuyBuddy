import prisma from "../../config/prisma.config";
import { HttpStatus } from "../../enums/httpStatus.enum";
import APIError from "../../utils/APIError";
import { shippingSelect, UpdateOpts } from "./order.select";
import {
  Prisma,
  Currency,
  PaymentStatus,
  OrderStatus,
  PaymentMethod,
  ShipmentStatus,
} from "@prisma/client";
import { round2 } from "../../utils/math.utilites";

type CartWithLines = Awaited<ReturnType<OrderService["getCartForCheckout"]>>;

class OrderService {
  private groupByBrand(cart: CartWithLines) {
    const byBrand = new Map<string, typeof cart.items>();
    for (const item of cart.items) {
      const brandId = item.variant.product.brandId as string;
      if (!byBrand.has(brandId)) byBrand.set(brandId, []);
      byBrand.get(brandId)!.push(item);
    }

    return [...byBrand.entries()].map(([brandId, items]) => ({
      brandId,
      items,
    }));
  }

  private async getCartForCheckout(userId: string) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            variant: { include: { product: { include: { brand: true } } } },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0)
      throw new APIError("Cart is empty", HttpStatus.BadRequest);

    return cart;
  }

  private async applyPromo(
    promoCode: string | undefined,
    subTotal: number
  ): Promise<number> {
    if (!promoCode) return 0;
    if (promoCode.toUpperCase() === "WELCOME10")
      return +(subTotal * 0.1).toFixed(2);
    return 0;
  }

  // TODO: Replace later with real logic/rates according to the place, currency ...
  private async calcShippingFee(
    brandId: string,
    _items: any[],
    _addressId?: string
  ): Promise<number> {
    return 40;
  }

  // TODO: set later
  // private async calcTax(subTotalMinusDiscount: number): Promise<number> {
  //   const rate = 0.0; // 0.14 for 14% VAT
  //   return +(subTotalMinusDiscount * rate).toFixed(2);
  // }

  async checkout(
    userId: string,
    currency: Currency,
    addressId: string,
    promoCode?: string
  ) {
    const cart = await this.getCartForCheckout(userId);
    const groups = this.groupByBrand(cart);

    return prisma.$transaction(async (tx) => {
      // atomically reserve stock
      for (const item of cart.items) {
        const updated = await tx.variant.updateMany({
          where: { id: item.variantId, stock: { gte: item.qty } },
          data: { stock: { decrement: item.qty } },
        });
        if (updated.count === 0) {
          throw new APIError(
            `Insufficient stock for variant ${item.variantId}`,
            HttpStatus.Conflict
          );
        }
      }

      // create draft order
      const order = await tx.order.create({
        data: {
          userId,
          itemsTotal: 0,
          discountTotal: 0,
          shippingTotal: 0,
          currency,
          paymentStatus: PaymentStatus.PENDING,
          status: OrderStatus.DRAFT,
          placedAt: new Date(),
        },
      });

      //  sub-orders & items (all are numbers thanks to $extends)
      let itemsTotal = 0;
      let discountTotal = 0;
      let shippingTotal = 0;

      for (const group of groups) {
        const itemsSubtotal = round2(
          group.items.reduce(
            (acc, it) => acc + Number(it.priceSnapshot) * it.qty,
            0
          )
        );
        // TODO: make promoCodes model
        const discount = await this.applyPromo(promoCode, itemsSubtotal);
        const shippingFee = await this.calcShippingFee(
          group.brandId,
          group.items,
          addressId
        );

        // sub-order
        const subOrder = await tx.subOrder.create({
          data: {
            orderId: order.id,
            brandId: group.brandId,
            subtotal: itemsSubtotal,
            discount,
            shippingFee,
          },
        });

        // items
        for (const it of group.items) {
          await tx.orderItem.create({
            data: {
              subOrderId: subOrder.id,
              variantId: it.variantId,
              qty: it.qty,
              priceSnapshot: it.priceSnapshot,
            },
          });
        }

        itemsTotal += itemsSubtotal;
        discountTotal += discount;
        shippingTotal += shippingFee;
      }

      itemsTotal = round2(itemsTotal);
      discountTotal = round2(discountTotal);
      shippingTotal = round2(shippingTotal);

      // update order
      const updated = await tx.order.update({
        where: { id: order.id },
        data: {
          itemsTotal,
          discountTotal,
          shippingTotal,
          status: OrderStatus.PENDING_PAYMENT,
        },
        include: { subOrders: { include: { items: true } } },
      });

      // create pending payment with computed amount
      const amount = round2(itemsTotal - discountTotal + shippingTotal);
      await tx.payment.create({
        data: {
          orderId: order.id,
          provider: PaymentMethod.CASH_ON_DELIVERY, // set as default, change when paying
          status: PaymentStatus.PENDING,
          amount,
          currency,
        },
      });

      return { ...updated, payTotal: amount };
    });
  }

  async confirmPayment(
    orderId: string,
    provider: PaymentMethod,
    intentId?: string
  ) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order) throw new APIError("Order not found", HttpStatus.NotFound);
      if (order.status === OrderStatus.PAID) return order;

      const amount = round2(
        order.itemsTotal - order.discountTotal + order.shippingTotal
      );

      await tx.payment.updateMany({
        where: { orderId, status: PaymentStatus.PENDING },
        data: { status: PaymentStatus.CANCELED },
      });

      await tx.payment.create({
        data: {
          orderId,
          provider,
          intentId,
          status: PaymentStatus.SUCCEEDED,
          amount,
          currency: order.currency,
        },
      });

      // clear cart
      const cart = await tx.cart.findUnique({
        where: { userId: order.userId },
      });
      await tx.cartItem.deleteMany({ where: { cartId: cart?.id } });

      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: PaymentStatus.SUCCEEDED,
          status: OrderStatus.PAID,
        },
      });

      const subs = await tx.subOrder.findMany({ where: { orderId } });
      for (const sub of subs) {
        await tx.shipment.create({
          data: { subOrderId: sub.id, status: ShipmentStatus.PENDING },
        });
      }

      return updated;
    });
  }

  async cancelOrder(userId: string, orderId: string, reason?: string) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, userId },
        include: { subOrders: { include: { items: true, shipments: true } } },
      });
      if (!order) throw new APIError("Order not found", HttpStatus.NotFound);
      if (
        order.status === OrderStatus.CANCELED ||
        order.status === OrderStatus.FULFILLED ||
        order.status === OrderStatus.REFUNDED
      )
        throw new APIError(
          `Can't cancel! Orderd status is ${order.status}`,
          HttpStatus.Conflict
        );

      const moving = order.subOrders.some((so) =>
        so.shipments.some(
          (s) =>
            s.status === ShipmentStatus.IN_TRANSIT ||
            s.status === ShipmentStatus.DELIVERED
        )
      );
      if (moving)
        throw new APIError(
          "Order already in shipment; cannot cancel now",
          HttpStatus.Conflict
        );

      // restock
      for (const so of order.subOrders) {
        for (const it of so.items) {
          await tx.variant.update({
            where: { id: it.variantId },
            data: { stock: { increment: it.qty } },
          });
        }
      }

      const canceled = await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.CANCELED },
      });

      // TODO: record refund payment row

      return canceled;
    });
  }

  async getOrder(userId: string, orderId: string) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        subOrders: {
          include: { items: { include: { variant: true } }, shipments: true },
        },
        payments: true,
      },
    });
    if (!order) throw new APIError("Order not found", HttpStatus.NotFound);

    const total = round2(
      order.itemsTotal - order.discountTotal + order.shippingTotal
    );
    return { ...order, payTotal: total };
  }

  async getAllOrders(userId: string, limit = 20) {
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        subOrders: { include: { items: true, shipments: true } },
        payments: true,
      },
    });
    return orders.map((o) => ({
      ...o,
      payTotal: round2(o.itemsTotal - o.discountTotal + o.shippingTotal),
    }));
  }
}

export default new OrderService();
