import { Request, Response, NextFunction } from "express";
import { HttpStatus } from "../../enums/httpStatus.enum";
import { sendResponse } from "../../utils/response";

import { listTagsForProduct, attachTagToProduct } from "./tag.service";

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

export async function attachTagToProductCtrl(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { productId } = req.params as { productId: string };
    const { nameOrSlug, pinned } = req.body as {
      nameOrSlug: string;
      pinned?: boolean;
    };

    const out = await attachTagToProduct(productId, nameOrSlug, { pinned });

    sendResponse(res, {
      statusCode: HttpStatus.OK,
      data: out,
    });
  } catch (err) {
    next(err);
  }
}
