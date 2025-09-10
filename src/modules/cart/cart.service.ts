import prisma from "../../config/prisma.config";
import logger from "../../config/logger.config";
import { HttpStatus } from "../../enums/httpStatus.enum";
import APIError from "../../utils/APIError";
import {
  ComputeTotalsPayload,
  GetCartPayload,
  GetOrCreateCartPayload,
} from "./cart.type";
import is from "zod/v4/locales/is.cjs";

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
      include: { items: true },
    });

    let isNew = false;
    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId,
        },
        include: { items: true },
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
}

export default new CartService();
