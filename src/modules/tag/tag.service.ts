import slugify from "slugify";
import prisma from "../../config/prisma.config";

async function upsertTagByName(nameOrSlug: string) {
  const slug = slugify(nameOrSlug, { lower: true, strict: true });
  return prisma.tag.upsert({
    where: { slug },
    update: { name: nameOrSlug },
    create: { name: nameOrSlug, slug },
  });
}

export async function listTagsForProduct(productId: string) {
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

export async function attachTagToProduct(
  productId: string,
  TagNameOrSlug: string,
  opts?: { pinned?: boolean }
) {
  // Ensure tag exists
  const tag = await upsertTagByName(TagNameOrSlug);

  // Link (upsert) with metadata
  const link = await prisma.productTag.upsert({
    where: { productId_tagId: { productId, tagId: tag.id } },
    update: { pinned: !!opts?.pinned },
    create: { productId, tagId: tag.id, pinned: !!opts?.pinned },
  });

  return { tag: { id: tag.id, name: tag.name, slug: tag.slug }, link };
}
