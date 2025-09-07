import { Request, Response, NextFunction } from "express";
import prisma from "../../config/prisma.config";
import APIError from "../../utils/APIError";
import { HttpStatus } from "../../enums/httpStatus.enum";
import { sendResponse } from "../../utils/response";

import tagService from "./tag.service";

export async function listTagsForProduct(
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

export async function attachTagsToProductBulkCtrl(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const actorAccountId = (req as any)?.account?.id as string | undefined;
    const { productId } = req.params as { productId: string };
    const { tags } = req.body as {
      tags: { nameOrSlug: string; pinned?: boolean }[];
    };

    const items = await tagService.attachTagsToProductBulk(
      productId,
      tags ?? []
    );
    res.status(HttpStatus.OK).json({ items });
  } catch (err) {
    next(err);
  }
}

export async function detachTagFromProductCtrl(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const actorAccountId = (req as any)?.account?.id as string | undefined;
    const { productId, tagSlug } = req.params as {
      productId: string;
      tagSlug: string;
    };

    const out = await tagService.detachTagFromProduct(productId, tagSlug);
    res.status(HttpStatus.OK).json(out);
  } catch (err) {
    next(err);
  }
}

export async function togglePinnedCtrl(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const actorAccountId = (req as any)?.account?.id as string | undefined;
    const { productId, tagSlug } = req.params as {
      productId: string;
      tagSlug: string;
    };
    const { pinned } = req.body as { pinned: boolean };

    const row = await tagService.changeTagPinStatus(
      productId,
      tagSlug,
      !!pinned
    );
    res.status(HttpStatus.OK).json(row);
  } catch (err) {
    next(err);
  }
}

export async function listAllTagsCtrl(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const data = await tagService.listAllTags({ page, limit });
    res.status(HttpStatus.OK).json(data);
  } catch (err) {
    next(err);
  }
}

export async function listProductsByTagSlugCtrl(
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
    res.status(HttpStatus.OK).json(data);
  } catch (err) {
    next(err);
  }
}
