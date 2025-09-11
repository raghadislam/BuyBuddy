import { Prisma } from "@prisma/client";

export const cartSelect: Prisma.CartSelect = {
  id: true,
  userId: true,
  items: {
    select: {
      id: true,
      variantId: true,
      qty: true,
      priceSnapshot: true,
    },
  },
};
