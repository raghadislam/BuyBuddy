import type { Prisma, Category, ProductStatus } from "../../generated/prisma";
import { Page } from "../../utils/pagination";

export type ListProductsQuery = Page &
  Readonly<{
    q?: string;
    brandId?: string;
    category?: Category;
    status?: ProductStatus;
    material?: string;
    minPrice?: number;
    maxPrice?: number;
  }>;

// Prefer `interface` for reusable object contracts
export interface ImageInput {
  url: string;
  altText?: string | null;
  sortOrder?: number;
}

export type CreateProduct = Readonly<{
  brandId: string;
  category: Category;
  title: string;
  slug?: string;
  description?: string | null;
  attributes?: Prisma.InputJsonValue | null;
  status?: ProductStatus;
  material?: string | null;
  images?: ImageInput[];
}>;

// Update is Create minus brandId, all optional
export type UpdateProduct = Readonly<Partial<Omit<CreateProduct, "brandId">>>;

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
