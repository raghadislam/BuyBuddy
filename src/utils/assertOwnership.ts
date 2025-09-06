import prisma from "../config/prisma.config";
import APIError from "../utils/APIError";
import { HttpStatus } from "../enums/httpStatus.enum";

export async function assertBrandOwnership(brandId: string, accountId: string) {
  const brand = await prisma.brand.findUnique({
    where: { id: brandId },
    select: { accountId: true },
  });

  if (!brand || brand.accountId !== accountId)
    throw new APIError("Unauthorized Access.", HttpStatus.Unauthorized);
}

export async function assertProductOwnership(
  productId: string,
  accountId: string
) {
  const prod = await prisma.product.findUnique({
    where: { id: productId },
    select: { brand: { select: { accountId: true } } },
  });
  if (!prod || prod.brand.accountId !== accountId)
    throw new APIError("Unauthorized Access.", HttpStatus.Unauthorized);
}
