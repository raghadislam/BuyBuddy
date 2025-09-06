import { Request, Response, NextFunction } from "express";
import prisma from "../../config/prisma.config";
import APIError from "../../utils/APIError";
import { HttpStatus } from "../../enums/httpStatus.enum";
import { sendResponse } from "../../utils/response";

import { listTagsForProduct } from "./tag.service";

export async function listTagsForProductCtrl(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { productId } = req.params as { productId: string };
    const items = await listTagsForProduct(productId);

    sendResponse(res, {
      statusCode: HttpStatus.OK,
      data: items,
    });
  } catch (err) {
    next(err);
  }
}
