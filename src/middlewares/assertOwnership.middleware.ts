import { RequestHandler, Request } from "express";
import prisma from "../config/prisma.config";
import APIError from "../utils/APIError";
import { HttpStatus } from "../enums/httpStatus.enum";

export const assertBrandOwnership: RequestHandler = async (
  req: Request,
  res,
  next
) => {
  const body = req.body as any;

  const brand = await prisma.brand.findUnique({
    where: { id: body.brandId },
    select: { accountId: true },
  });

  const actorAccountId = (req as any)?.account?.id as string | undefined;

  if (!brand || brand.accountId !== actorAccountId)
    throw new APIError("Unauthorized Access.", HttpStatus.Unauthorized);
  next();
};

export const assertProductOwnership: RequestHandler = async (
  req: Request,
  res,
  next
) => {
  const { productId } = req.params as { productId: string };

  const prod = await prisma.product.findUnique({
    where: { id: productId },
    select: { brand: { select: { accountId: true } } },
  });

  const actorAccountId = (req as any)?.account?.id as string | undefined;

  if (!prod || prod.brand.accountId !== actorAccountId)
    throw new APIError("Unauthorized Access.", HttpStatus.Unauthorized);
  next();
};
