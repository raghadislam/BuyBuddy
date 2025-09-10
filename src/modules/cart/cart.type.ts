import { Variant } from "@prisma/client";
import { User } from "../user/user.type";

export type Cart = {
  id: string;
  user?: User;
  userId?: string;
  items?: CartItem[];
  createdAt?: Date;
  updatedAt?: Date;
};

export type CartItem = {
  id: string;
  cartId?: string;
  cart?: Cart;
  variantId?: string;
  variant?: Variant;
  qty?: number;
  priceSnapshot?: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export type ComputeTotalsPayload = {
  cart: Cart;
};

export type GetOrCreateCartPayload = {
  userId: string;
};

export type GetCartPayload = GetOrCreateCartPayload;
