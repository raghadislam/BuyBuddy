// import { promises } from "dns";
import type { Prisma, Category, ProductStatus } from "../../generated/prisma";
// import type { Prisma } from "@prisma/client";

export interface PageOptions {
  page?: number; // 1- pased
  limit?: number; // default 20, max 100
}

export interface ListProductsQuery extends PageOptions {
  q?: string;
  brandId?: string;
  category?: Category;
  status?: ProductStatus;
  material?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface ImageInput {
  url: string;
  altText?: string | null;
  sortOrder?: number;
}

export interface CreateProduct {
  brandId: string;
  category: Category;
  title: string;
  slug?: string;
  description?: string | null;
  attributes?: Prisma.InputJsonValue | null;
  status?: ProductStatus;
  material?: string | null;
  images?: ImageInput[];
}

export interface UpdateProduct {
  category?: Category;
  title?: string;
  slug?: string;
  description?: string | null;
  attributes?: Prisma.InputJsonValue | null;
  status: ProductStatus;
  material?: string | null;
  images?: ImageInput[];
}

export interface ProductServices {
  getAllProducts(
    query: ListProductsQuery
  ): Promise<{ items: any[]; page: number; limit: number; total: number }>;

  getProductById(id: string): Promise<any | null>;
  getProductBySlug(slug: string): Promise<any | null>;

  createProduct(payload: CreateProduct, actorAccountId: string): Promise<any>;
  updateProduct(
    productId: string,
    dto: UpdateProduct,
    actorAccountId: string
  ): Promise<any>;
  deleteProductById(
    productId: string,
    actorAccountId: string
  ): Promise<{ id: string }>;

  publish(
    productId: string,
    actorAccountId: string
  ): Promise<{ id: string; status: ProductStatus }>;
  unpublish(
    productId: string,
    actorAccountId: string
  ): Promise<{ id: string; status: ProductStatus }>;
  archive(
    productId: string,
    actorAccountId: string
  ): Promise<{ id: string; status: ProductStatus }>;
}
