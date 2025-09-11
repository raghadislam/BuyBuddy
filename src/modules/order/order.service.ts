import prisma from "../../config/prisma.config";
import { HttpStatus } from "../../enums/httpStatus.enum";
import APIError from "../../utils/APIError";

type CartWithLines = Awaited<ReturnType<OrderService["getCartForCheckout"]>>;

class OrderService {
  private groupByBrand(cart: CartWithLines) {
    const byBrand = new Map<String, typeof cart.items>();
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
  private async calcTax(subTotalMinusDiscount: number): Promise<number> {
    const rate = 0.0; // 0.14 for 14% VAT
    return +(subTotalMinusDiscount * rate).toFixed(2);
  }
}
