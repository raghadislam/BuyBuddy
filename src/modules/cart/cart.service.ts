import prisma from "../../config/prisma.config";
import logger from "../../config/logger.config";
import { HttpStatus } from "../../enums/httpStatus.enum";
import APIError from "../../utils/APIError";
import {
  ComputeTotalsPayload,
  GetCartPayload,
  GetOrCreateCartPayload,
  AddItemPayload,
} from "./cart.type";
import { cartSelect } from "./cart.select";

class CartService {
  private async computeTotals(payload: ComputeTotalsPayload) {
    const { cart } = payload;
    const items = cart.items || [];

    const subTotal = items.reduce(
      (acc, item) => acc + (item.priceSnapshot || 0) * (item.qty || 0),
      0
    );
    const itemsCount = items.reduce((acc, item) => acc + (item.qty || 0), 0);

    return { subTotal, itemsCount };
  }

  private async getOrCreateCart(payload: GetOrCreateCartPayload) {
    const { userId } = payload;
    let cart = await prisma.cart.findUnique({
      where: { userId },
      select: cartSelect,
    });

    let isNew = false;
    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId,
        },
        select: cartSelect,
      });
      isNew = true;
    }

    if (!cart) {
      logger.error(`Failed to get or create cart for user ${userId}`);
      throw new APIError(
        "Failed to get or create cart",
        HttpStatus.InternalServerError
      );
    }

    return { cart, isNew };
  }

  async getCart(payload: GetCartPayload) {
    const { cart, isNew } = await this.getOrCreateCart(payload);
    const totals = await this.computeTotals({ cart });
    return { cart: { ...cart, ...totals }, isNew };
  }

  async addItem(payload: AddItemPayload) {
    const { userId, variantId, qty } = payload;
    return prisma.$transaction(async (tx) => {
      const variant = await tx.variant.findUnique({
        where: { id: variantId },
        select: { price: true, stock: true },
      });

      if (!variant) {
        throw new APIError("Variant not found", HttpStatus.NotFound);
      }

      let cart = await tx.cart.findUnique({
        where: { userId },
        select: { id: true },
      });
      if (!cart) {
        cart = await tx.cart.create({
          data: { userId },
          select: { id: true },
        });
      }

      const existingItem = await tx.cartItem.findUnique({
        where: { cartId_variantId: { cartId: cart.id, variantId } },
      });

      const totalQty = existingItem ? existingItem.qty + qty : qty;
      if (totalQty > variant.stock) {
        throw new APIError(
          "Insufficient stock for requested quantity",
          HttpStatus.BadRequest
        );
      }

      if (existingItem) {
        await tx.cartItem.update({
          where: { id: existingItem.id },
          data: { qty: existingItem.qty + qty },
        });
      } else {
        await tx.cartItem.create({
          data: {
            cartId: cart.id,
            variantId,
            qty,
            priceSnapshot: variant.price,
          },
        });
      }

      const updatedCart = await tx.cart.findUnique({
        where: { id: cart.id },
        select: cartSelect,
      });
      const totals = await this.computeTotals({ cart: updatedCart! });

      logger.info(
        `Added item to cart: userId=${userId}, variantId=${variantId}, qty=${qty}`
      );
      return { cart: { ...updatedCart, ...totals } };
    });
  }
}

export default new CartService();
