import prisma from "../../config/prisma.config";

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
