import { Request, Response, NextFunction } from "express";
import { HttpStatus } from "../../enums/httpStatus.enum";
import APIError from "../../utils/APIError";
import { ProductService } from "./product.service";
import { toPrismaJson } from "./product.validation";
import { sendResponse } from "../../utils/response";

/** GET /products */
export async function getAllProducts(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const data = await ProductService.getAllProducts(req.query as any);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    data,
  });
}

/** GET /products/:productId */
export async function getProductById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { productId } = req.params as { productId: string };
  const data = await ProductService.getProductById(productId);
  if (!data)
    return sendResponse(res, {
      statusCode: HttpStatus.NotFound,
      message: "Product Not Found.",
    });

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    data,
  });
}

/** GET /products/slug/:slug */
export async function getProductBySlug(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { slug } = req.params as { slug: string };
  const data = await ProductService.getProductBySlug(slug);

  if (!data)
    return sendResponse(res, {
      statusCode: HttpStatus.NotFound,
      message: "Product Not Found.",
    });

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    data,
  });
}

/** POST /products (auth) */
export async function createProduct(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const actorAccountId = (req as any)?.account?.id as string | undefined;
  if (!actorAccountId)
    throw new APIError("Unauthorized", HttpStatus.Unauthorized);

  const body = req.body as any;
  const payload = { ...body, attributes: toPrismaJson(body.attributes) };
  const created = await ProductService.createProduct(payload, actorAccountId);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    data: created,
  });
}

/** PATCH /products/:productId (auth) */
export async function updateProduct(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const actorAccountId = (req as any)?.account?.id as string | undefined;
  if (!actorAccountId)
    throw new APIError("Unauthorized", HttpStatus.Unauthorized);

  const { productId } = req.params as { productId: string };
  const body = req.body as any; // validated
  const payload = { ...body, attributes: toPrismaJson(body.attributes) };
  const updated = await ProductService.updateProduct(
    productId,
    payload,
    actorAccountId
  );

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    data: updated,
  });
}

/** DELETE /products/:productId (auth) */
export async function deleteProduct(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const actorAccountId = (req as any)?.account?.id as string | undefined;
  if (!actorAccountId)
    throw new APIError("Unauthorized", HttpStatus.Unauthorized);

  const { productId } = req.params as { productId: string };
  await ProductService.deleteProductById(productId, actorAccountId);

  sendResponse(res, {
    statusCode: HttpStatus.NoContent,
  });
}

/** POST /products/:productId/publish (auth) */
export async function publishProduct(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const actorAccountId = (req as any)?.account?.id as string | undefined;
  if (!actorAccountId)
    throw new APIError("Unauthorized", HttpStatus.Unauthorized);

  const { productId } = req.params as { productId: string };
  const out = await ProductService.publish(productId, actorAccountId);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    data: out,
  });
}

/** POST /products/:productId/unpublish (auth) */
export async function unpublishProduct(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const actorAccountId = (req as any)?.account?.id as string | undefined;
  if (!actorAccountId)
    throw new APIError("Unauthorized", HttpStatus.Unauthorized);

  const { productId } = req.params as { productId: string };
  const out = await ProductService.unpublish(productId, actorAccountId);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    data: out,
  });
}

/** POST /products/:productId/archive (auth) */
export async function archiveProduct(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const actorAccountId = (req as any)?.account?.id as string | undefined;
  if (!actorAccountId)
    throw new APIError("Unauthorized", HttpStatus.Unauthorized);

  const { productId } = req.params as { productId: string };
  const out = await ProductService.archive(productId, actorAccountId);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    data: out,
  });
}

/* ---------------- Product Tags sub-controllers ---------------- */

// import {
//     listTagsForProduct,
//     attachTagToProduct,
//     attachTagsToProductBulk,
//     detachTagFromProduct,
//     togglePinned,
//     listAllTags,
//     listProductsByTagSlug,
//   } from "./tag.services";

//   /** GET /products/:productId/tags */
//   export async function listProductTagsCtrl(
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ) {
//     try {
//       const { productId } = req.params as { productId: string };
//       const items = await listTagsForProduct(productId);
//       res.status(HttpStatus.OK).json({ items });
//     } catch (err) {
//       next(err);
//     }
//   }

//   /** POST /products/:productId/tags (auth) */
//   export async function attachTagCtrl(
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ) {
//     try {
//       const actorAccountId = (req as any)?.account?.id as string | undefined;
//       if (!actorAccountId)
//         throw new APIError("Unauthorized", HttpStatus.Unauthorized);

//       const { productId } = req.params as { productId: string };
//       const { nameOrSlug, pinned } = req.body as {
//         nameOrSlug: string;
//         pinned?: boolean;
//       };
//       // ownership guard is inside ProductService; for tags, we can reuse it if preferred
//       await ProductService["updateProduct"]; // no-op import retention (tree-shaking caveat)
//       const out = await attachTagToProduct(productId, nameOrSlug, { pinned });
//       res.status(HttpStatus.Created).json(out);
//     } catch (err) {
//       next(err);
//     }
//   }

//   /** POST /products/:productId/tags/bulk (auth) */
//   export async function attachTagsBulkCtrl(
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ) {
//     try {
//       const actorAccountId = (req as any)?.account?.id as string | undefined;
//       if (!actorAccountId)
//         throw new APIError("Unauthorized", HttpStatus.Unauthorized);

//       const { productId } = req.params as { productId: string };
//       const { tags } = req.body as {
//         tags: { nameOrSlug: string; pinned?: boolean }[];
//       };
//       const out = await attachTagsToProductBulk(productId, tags);
//       res.status(HttpStatus.OK).json({ items: out });
//     } catch (err) {
//       next(err);
//     }
//   }

//   /** DELETE /products/:productId/tags/:tagSlug (auth) */
//   export async function detachTagCtrl(
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ) {
//     try {
//       const actorAccountId = (req as any)?.account?.id as string | undefined;
//       if (!actorAccountId)
//         throw new APIError("Unauthorized", HttpStatus.Unauthorized);

//       const { productId, tagSlug } = req.params as {
//         productId: string;
//         tagSlug: string;
//       };
//       const out = await detachTagFromProduct(productId, tagSlug);
//       res.status(HttpStatus.OK).json(out);
//     } catch (err) {
//       next(err);
//     }
//   }

//   /** POST /products/:productId/tags/:tagSlug/pinned (auth) */
//   export async function togglePinnedCtrl(
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ) {
//     try {
//       const actorAccountId = (req as any)?.account?.id as string | undefined;
//       if (!actorAccountId)
//         throw new APIError("Unauthorized", HttpStatus.Unauthorized);

//       const { productId, tagSlug } = req.params as {
//         productId: string;
//         tagSlug: string;
//       };
//       const { pinned } = req.body as { pinned: boolean };
//       const row = await togglePinned(productId, tagSlug, !!pinned);
//       res.status(HttpStatus.OK).json(row);
//     } catch (err) {
//       next(err);
//     }
//   }

//   /** GET /products/tags */
//   export async function listAllTagsCtrl(
//     _req: Request,
//     res: Response,
//     next: NextFunction
//   ) {
//     try {
//       const data = await listAllTags();
//       res.status(HttpStatus.OK).json(data);
//     } catch (err) {
//       next(err);
//     }
//   }

//   /** GET /products/tags/:tagSlug/products */
//   export async function listProductsByTagSlugCtrl(
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ) {
//     try {
//       const { tagSlug } = req.params as { tagSlug: string };
//       const data = await listProductsByTagSlug(tagSlug, req.query as any);
//       res.status(HttpStatus.OK).json(data);
//     } catch (err) {
//       next(err);
//     }
//   }
