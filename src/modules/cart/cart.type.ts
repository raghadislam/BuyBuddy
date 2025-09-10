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

export type AddItemPayload = {
  userId: string;
  variantId: string;
  qty: number;
};

export type UpdateItemPayload = AddItemPayload;

export type RemoveItemPayload = {
  userId: string;
  variantId: string;
};
