import e, { RequestHandler } from "express";
import cartService from "./cart.service";
import {
  GetCartPayload,
  AddItemPayload,
  UpdateItemPayload,
  RemoveItemPayload,
  ClearCartPayload,
  PreflightCheckoutPayload,
} from "./cart.type";
import { sendResponse } from "../../utils/response";
import { HttpStatus } from "../../enums/httpStatus.enum";

export const getCart: RequestHandler = async (req, res, next) => {
  const payload: GetCartPayload = {
    userId: req.account?.user?.id!,
  };

  const { cart, isNew } = await cartService.getCart(payload);

  sendResponse(res, {
    statusCode: isNew ? HttpStatus.Created : HttpStatus.OK,
    message: isNew
      ? "Cart created successfully."
      : "Cart retrieved successfully.",
    data: {
      cart,
    },
  });
};

export const addItem: RequestHandler = async (req, res, next) => {
  const payload: AddItemPayload = {
    userId: req.account?.user?.id!,
    variantId: req.params.variantId,
    qty: req.body.qty,
  };

  const data = await cartService.addItem(payload);

  sendResponse(res, {
    statusCode: HttpStatus.Created,
    message: "Item added to cart successfully.",
    data,
  });
};

export const updateItem: RequestHandler = async (req, res, next) => {
  const payload: UpdateItemPayload = {
    userId: req.account?.user?.id!,
    variantId: req.params.variantId,
    qty: req.body.qty,
  };

  const data = await cartService.updateItem(payload);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    message: "Item updated in cart successfully.",
    data,
  });
};

export const removeItem: RequestHandler = async (req, res, next) => {
  const payload: RemoveItemPayload = {
    userId: req.account?.user?.id!,
    variantId: req.params.variantId,
  };

  const data = await cartService.removeItem(payload);

  sendResponse(res, {
    statusCode: HttpStatus.NoContent,
    message: "Item removed from cart successfully.",
  });
};

export const clearCart: RequestHandler = async (req, res, next) => {
  const payload: ClearCartPayload = {
    userId: req.account?.user?.id!,
  };

  await cartService.clearCart(payload);

  sendResponse(res, {
    statusCode: HttpStatus.NoContent,
    message: "Cart cleared successfully.",
  });
};

export const preflightCheckout: RequestHandler = async (req, res, next) => {
  const payload: PreflightCheckoutPayload = {
    userId: req.account?.user?.id!,
  };

  await cartService.preflightCheckout(payload);

  sendResponse(res, {
    statusCode: HttpStatus.NoContent,
    message: "Preflight checkout successful.",
  });
};
