import slugify from "slugify";
import prisma from "../../config/prisma.config";
import {
  productCardSelect,
  productDetailSelect,
} from "../product/product.select";
import { Page, normalizePage } from "../../utils/pagination";
import { TagService } from "./tag.interface";

class tagService implements TagService {
  async #upsertTagByName(nameOrSlug: string) {
    const slug = slugify(nameOrSlug, { lower: true, strict: true });
    return prisma.tag.upsert({
      where: { slug },
      update: { name: nameOrSlug },
      create: { name: nameOrSlug, slug },
    });
  }

  async listTagsForProduct(productId: string) {
    const rows = await prisma.productTag.findMany({
      where: { productId },
      include: { tag: true },
      orderBy: [{ pinned: "desc" }, { addedAt: "desc" }],
    });
    return rows.map((r) => ({
      id: r.tag.id,
      name: r.tag.name,
      slug: r.tag.slug,
      pinned: r.pinned,
      addedAt: r.addedAt,
    }));
  }

  async attachTagToProduct(
    productId: string,
    TagNameOrSlug: string,
    opts?: { pinned?: boolean }
  ) {
    // Ensure tag exists
    const tag = await this.#upsertTagByName(TagNameOrSlug);

    // Link (upsert) with metadata
    const link = await prisma.productTag.upsert({
      where: { productId_tagId: { productId, tagId: tag.id } },
      update: { pinned: !!opts?.pinned },
      create: { productId, tagId: tag.id, pinned: !!opts?.pinned },
    });

    return { tag: { id: tag.id, name: tag.name, slug: tag.slug }, link };
  }

  async attachTagsToProductBulk(
    productId: string,
    tags: { nameOrSlug: string; pinned?: boolean }[]
  ) {
    if (!tags?.length) return [];

    return prisma.$transaction(async (tx) => {
      const results: { tagId: string; slug: string }[] = [];
      for (const t of tags) {
        const slug = slugify(t.nameOrSlug, { lower: true, strict: true });

        let tag = await tx.tag.findUnique({ where: { slug } });
        if (!tag)
          tag = await tx.tag.create({ data: { name: t.nameOrSlug, slug } });

        await tx.productTag.upsert({
          where: { productId_tagId: { productId, tagId: tag.id } },
          update: { pinned: !!t.pinned },
          create: { productId, tagId: tag.id, pinned: !!t.pinned },
        });

        results.push({ tagId: tag.id, slug: tag.slug });
      }
      return results;
    });
  }

  async detachTagFromProduct(productId: string, tagSlug: string) {
    const tag = await prisma.tag.findUnique({ where: { slug: tagSlug } });
    if (!tag) return { removed: false };
    await prisma.productTag
      .delete({ where: { productId_tagId: { productId, tagId: tag.id } } })
      .catch(() => null); // ignore if already absent
    return { removed: true };
  }

  async changeTagPinStatus(
    productId: string,
    tagSlug: string,
    pinned: boolean
  ) {
    const tag = await prisma.tag.findUnique({ where: { slug: tagSlug } });
    if (!tag) throw new Error("TAG_NOT_FOUND");

    return prisma.productTag.update({
      where: { productId_tagId: { productId, tagId: tag.id } },
      data: { pinned },
    });
  }

  async listAllTags(p?: Page) {
    const { skip, take, page, limit } = normalizePage(p);
    const [items, total] = await Promise.all([
      prisma.tag.findMany({ orderBy: { name: "asc" }, skip, take }),
      prisma.tag.count(),
    ]);
    return { items, page, limit, total };
  }

  async listProductsByTagSlug(tagSlug: string, p?: Page) {
    const tag = await prisma.tag.findUnique({ where: { slug: tagSlug } });
    if (!tag) return { tag: null, items: [], page: 1, limit: 20, total: 0 };

    const { skip, take, page, limit } = normalizePage(p);
    const [links, total] = await Promise.all([
      prisma.productTag.findMany({
        where: { tagId: tag.id, product: { status: "PUBLISHED" as any } },
        include: {
          product: {
            select: productCardSelect,
          },
        },
        orderBy: [{ pinned: "desc" }, { addedAt: "desc" }],
        skip,
        take,
      }),
      prisma.productTag.count({
        where: { tagId: tag.id, product: { status: "PUBLISHED" as any } },
      }),
    ]);

    return {
      tag: { id: tag.id, name: tag.name, slug: tag.slug },
      items: links.map((l) => l.product),
      page,
      limit,
      total,
    };
  }
}

export default new tagService();
