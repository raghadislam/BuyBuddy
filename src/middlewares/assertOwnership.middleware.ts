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

export const assertReviewOwnership: RequestHandler = async (
  req: Request,
  res,
  next
) => {
  const { reviewId } = req.params;
  const account = (req as any).account;
  console.log(account);

  if (!account)
    return res
      .status(HttpStatus.Unauthorized)
      .json({ message: "You Have to login to do this action." });

  if (account.role === "ADMIN") {
    return next();
  }

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { userId: true },
  });
  if (!review)
    return res
      .status(HttpStatus.NotFound)
      .json({ message: "Review not found" });

  if (review.userId !== account?.user?.id) {
    return res
      .status(HttpStatus.Forbidden)
      .json({ message: "Forbidden! You are not the reviewer account." });
  }
  next();
};
