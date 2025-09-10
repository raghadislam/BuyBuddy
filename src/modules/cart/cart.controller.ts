import { RequestHandler } from "express";
import cartService from "./cart.service";
import { GetCartPayload, AddItemPayload, UpdateItemPayload } from "./cart.type";
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
    statusCode: HttpStatus.OK,
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
