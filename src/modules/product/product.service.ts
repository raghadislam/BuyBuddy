import slugify from "slugify";
import prisma from "../../config/prisma.config";
import { Prisma } from "../../generated/prisma";
import { normalizePage } from "../../utils/pagination";
import { productCardSelect, productDetailSelect } from "./product.select";
import {
  assertBrandOwnership,
  assertProductOwnership,
} from "../../utils/assertOwnership";
import {
  ProductServices,
  ListProductsQuery,
  CreateProduct,
  UpdateProduct,
} from "./product.interface";

export const ProductService: ProductServices = {
  async getAllProducts(query: ListProductsQuery) {
    const { page, limit, skip, take } = normalizePage(query);
    const where: Prisma.ProductWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.brandId) where.brandId = query.brandId;
    if (query.category) where.category = query.category;
    if (query.material) where.material = query.material;
    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: "insensitive" } },
        { description: { contains: query.q, mode: "insensitive" } },
      ];
    }

    if (query.minPrice || query.maxPrice) {
      where.variants = {
        some: {
          ...(query.minPrice ? { price: { gte: query.minPrice } } : {}),
          ...(query.maxPrice ? { price: { lte: query.maxPrice } } : {}),
        },
      };
    }

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
        select: productCardSelect,
      }),
      prisma.product.count({ where }),
    ]);

    return { items, page, limit, total };
  },

  async getProductById(id: string) {
    return await prisma.product.findFirst({
      where: { id },
      select: productDetailSelect,
    });
  },

  async getProductBySlug(slug: string) {
    return await prisma.product.findFirst({
      where: { slug },
      select: productDetailSelect,
    });
  },

  async createProduct(payload: CreateProduct, actorAccountId: string) {
    await assertBrandOwnership(payload.brandId, actorAccountId);
    const slug =
      payload.slug ?? slugify(payload.title, { lower: true, strict: true });

    return prisma.product.create({
      data: {
        brandId: payload.brandId,
        category: payload.category,
        title: payload.title,
        slug,
        description: payload.description ?? undefined,
        attributes: payload.attributes ?? undefined,
        material: payload.material ?? undefined,
        status: payload.status ?? "DRAFT",
        images: payload.images?.length
          ? {
              create: payload.images.map((i, idx) => ({
                url: i.url,
                altText: i.altText ?? undefined,
                sortOrder: i.sortOrder ?? idx,
              })),
            }
          : undefined,
      },
      select: productDetailSelect,
    });
  },

  async updateProduct(
    productId: string,
    payload: UpdateProduct,
    actorAccountId: string
  ) {
    await assertProductOwnership(productId, actorAccountId);

    const data: Prisma.ProductUpdateInput = {
      category: payload.category ?? undefined,
      title: payload.title ?? undefined,
      slug:
        payload.slug ??
        (payload.title
          ? slugify(payload.title, { lower: true, strict: true })
          : undefined),
      description: payload.description ?? undefined,
      attributes: payload.attributes ?? undefined,
      material: payload.material ?? undefined,
      status: payload.status ?? undefined,
    };

    if (payload.images) {
      data.images = {
        deleteMany: { productId },
        create: payload.images.map((i, idx) => ({
          url: i.url,
          altText: i.altText ?? undefined,
          sortOrder: i.sortOrder ?? idx,
        })),
      };
    }

    return prisma.product.update({
      where: { id: productId },
      data,
      select: productDetailSelect,
    });
  },

  async deleteProductById(productId: string, actorAccountId: string) {
    await assertProductOwnership(productId, actorAccountId);
    await prisma.$transaction(async (tx) => {
      await tx.productTag.deleteMany({ where: { productId } });
      await tx.productImage.deleteMany({ where: { productId } });
      await tx.variantImage.deleteMany({ where: { variant: { productId } } });
      await tx.variantOption.deleteMany({ where: { variant: { productId } } });
      await tx.variant.deleteMany({ where: { productId } });
      await tx.product.delete({ where: { id: productId } });
    });
    return { id: productId };
  },
  async publish(productId: string, actorAccountId: string) {
    await assertProductOwnership(productId, actorAccountId);
    return prisma.product.update({
      where: { id: productId },
      data: { status: "PUBLISHED" },
      select: { id: true, status: true },
    });
  },

  async unpublish(productId: string, actorAccountId: string) {
    await assertProductOwnership(productId, actorAccountId);
    return prisma.product.update({
      where: { id: productId },
      data: { status: "DRAFT" },
      select: { id: true, status: true },
    });
  },

  async archive(productId: string, actorAccountId: string) {
    await assertProductOwnership(productId, actorAccountId);
    return prisma.product.update({
      where: { id: productId },
      data: { status: "ARCHIVED" },
      select: { id: true, status: true },
    });
  },
};
