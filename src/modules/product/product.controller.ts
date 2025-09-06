import { Request, Response, NextFunction } from "express";
import { HttpStatus } from "../../enums/httpStatus.enum";
import APIError from "../../utils/APIError";
import { ProductService } from "./product.service";
import { toPrismaJson } from "./product.validation";
import { sendResponse } from "../../utils/response";

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
