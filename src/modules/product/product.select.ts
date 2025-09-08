import { Prisma } from "../../generated/prisma";

export const productCardSelect: Prisma.ProductSelect = {
  id: true,
  brandId: true,
  category: true,
  title: true,
  slug: true,
  material: true,
  status: true,
  createdAt: true,
  avgRating: true,
  ratingsCount: true,
  reviews: true,
  images: {
    select: { id: true, url: true, altText: true, sortOrder: true },
    orderBy: { sortOrder: "asc" },
  },
  variants: {
    select: { id: true, sku: true, price: true, currency: true, stock: true },
    take: 8,
  },
};

export const productDetailSelect: Prisma.ProductSelect = {
  id: true,
  brandId: true,
  category: true,
  title: true,
  slug: true,
  description: true,
  attributes: true,
  material: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  images: {
    select: { id: true, url: true, altText: true, sortOrder: true },
    orderBy: { sortOrder: "asc" },
  },
  variants: {
    select: {
      id: true,
      sku: true,
      price: true,
      currency: true,
      stock: true,
      images: {
        select: { id: true, url: true, altText: true, sortOrder: true },
        orderBy: { sortOrder: "asc" },
      },
      options: true,
    },
  },
  tags: {
    select: {
      tag: { select: { id: true, name: true, slug: true } },
      pinned: true,
      addedAt: true,
    },
  },
};
