import { RequestHandler } from "express";
import cartService from "./cart.service";
import { GetCartPayload } from "./cart.type";
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
