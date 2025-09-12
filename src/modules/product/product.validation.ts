import { z } from "zod";
import { Category, ProductStatus, Prisma } from "@prisma/client";

export const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const ImageInput = z.object({
  url: z.string().url(),
  altText: z.string().max(160).optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
});

/* ---------------- Body Schemas ---------------- */
export const createProductZodSchema = z.object({
  body: z.object({
    brandId: z.string().uuid(),
    category: z.enum(Category),
    title: z.string().min(3).max(140),
    slug: z.string().regex(slugRegex).optional(),
    description: z.string().max(4000).optional().nullable(),
    attributes: z.any().optional().nullable(),
    material: z.string().max(120).optional().nullable(),
    images: z.array(ImageInput).default([]),
    status: z.enum(ProductStatus).optional(),
  }),
});

export const updateProductZodSchema = z.object({
  body: z.object({
    category: z.enum(Category).optional(),
    title: z.string().min(3).max(140).optional(),
    slug: z.string().regex(slugRegex).optional(),
    description: z.string().max(4000).optional().nullable(),
    attributes: z.any().optional().nullable(),
    material: z.string().max(120).optional().nullable(),
    status: z.enum(ProductStatus).optional(),
    images: z.array(ImageInput).optional(),
  }),
});

/* ---------------- Query Schemas ---------------- */
export const listProductsQueryZodSchema = z.object({
  query: z.object({
    q: z.string().max(120).optional(),
    brandId: z.string().uuid().optional(),
    category: z.enum(Category).optional(),
    status: z.enum(ProductStatus).optional(),
    material: z.string().max(120).optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
  }),
});

/* ---------------- Param Schemas ---------------- */
export const productIdParamZodSchema = z.object({
  params: z.object({ productId: z.string().uuid() }),
});

export const productSlugParamZodSchema = z.object({
  params: z.object({ slug: z.string().regex(slugRegex) }),
});

/* ---------------- Util ---------------- */
export const toPrismaJson = (v: unknown): Prisma.InputJsonValue | undefined =>
  v === undefined ? undefined : (v as Prisma.InputJsonValue);
