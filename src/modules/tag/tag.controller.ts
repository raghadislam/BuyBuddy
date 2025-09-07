import { Request, Response, NextFunction } from "express";
import prisma from "../../config/prisma.config";
import APIError from "../../utils/APIError";
import { HttpStatus } from "../../enums/httpStatus.enum";
import { sendResponse } from "../../utils/response";

import tagService from "./tag.service";

export async function getTagsForProduct(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { productId } = req.params as { productId: string };
    const items = await tagService.listTagsForProduct(productId);

    sendResponse(res, {
      statusCode: HttpStatus.OK,
      data: items,
    });
  } catch (err) {
    next(err);
  }
}

export async function attachTagToProduct(
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

    const out = await tagService.attachTagToProduct(productId, nameOrSlug, {
      pinned,
    });

    sendResponse(res, {
      statusCode: HttpStatus.OK,
      data: out,
    });
  } catch (err) {
    next(err);
  }
}

export async function attachTagsToProductBulk(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { productId } = req.params as { productId: string };
    const { tags } = req.body as {
      tags: { nameOrSlug: string; pinned?: boolean }[];
    };

    const items = await tagService.attachTagsToProductBulk(
      productId,
      tags ?? []
    );

    sendResponse(res, {
      statusCode: HttpStatus.OK,
      data: items,
    });
  } catch (err) {
    next(err);
  }
}

export async function detachTagFromProduct(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { productId, tagSlug } = req.params as {
      productId: string;
      tagSlug: string;
    };

    const out = await tagService.detachTagFromProduct(productId, tagSlug);
    let statusCode = HttpStatus.NotFound;
    if (out.removed) statusCode = HttpStatus.OK;

    sendResponse(res, {
      statusCode,
      data: out,
    });
  } catch (err) {
    next(err);
  }
}

export async function changeTagPinStatus(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { productId, tagSlug } = req.params as {
      productId: string;
      tagSlug: string;
    };
    const { pinned } = req.body as { pinned: boolean };

    const tag = await tagService.changeTagPinStatus(
      productId,
      tagSlug,
      !!pinned
    );

    sendResponse(res, {
      statusCode: HttpStatus.OK,
      data: tag,
    });
  } catch (err) {
    next(err);
  }
}

export async function getAllTags(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const data = await tagService.listAllTags({ page, limit });

    sendResponse(res, {
      statusCode: HttpStatus.OK,
      data,
    });
  } catch (err) {
    next(err);
  }
}

export async function getProductsByTagSlug(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { tagSlug } = req.params as { tagSlug: string };
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;

    const data = await tagService.listProductsByTagSlug(tagSlug, {
      page,
      limit,
    });

    sendResponse(res, {
      statusCode: HttpStatus.OK,
      data,
    });
  } catch (err) {
    next(err);
  }
}
