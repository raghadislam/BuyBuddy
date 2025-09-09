import { Prisma, Tag, Product, ProductTag } from "../@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { Page } from "../../utils/pagination";

interface NormalizedPage {
  skip: number;
  take: number;
  page: number;
  limit: number;
}

type TagWithBasicInfo = {
  id: string;
  name: string;
  slug: string;
};

type ProductTagWithTag = ProductTag & {
  tag: Tag;
};

type TagLinkResult = {
  tagId: string;
  slug: string;
};

type TagAttachmentResult = {
  tag: TagWithBasicInfo;
  link: ProductTag;
};

type PaginatedResult<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
};

type ProductsByTagResult = {
  tag: TagWithBasicInfo | null;
  items: Product[];
  page: number;
  limit: number;
  total: number;
};

export interface TagService {
  listTagsForProduct(productId: string): Promise<
    Array<{
      id: string;
      name: string;
      slug: string;
      pinned: boolean;
      addedAt: Date;
    }>
  >;

  attachTagToProduct(
    productId: string,
    tagNameOrSlug: string,
    opts?: { pinned?: boolean }
  ): Promise<TagAttachmentResult>;

  attachTagsToProductBulk(
    productId: string,
    tags: Array<{ nameOrSlug: string; pinned?: boolean }>
  ): Promise<TagLinkResult[]>;

  detachTagFromProduct(
    productId: string,
    tagSlug: string
  ): Promise<{ removed: boolean }>;

  changeTagPinStatus(
    productId: string,
    tagSlug: string,
    pinned: boolean
  ): Promise<ProductTag>;

  listAllTags(p?: Page): Promise<PaginatedResult<Tag>>;

  listProductsByTagSlug(
    tagSlug: string,
    p?: Page
  ): Promise<ProductsByTagResult>;
}
