import { Prisma } from "@prisma/client";

export const shippingSelect = {
  id: true,
  status: true,
  subOrder: {
    select: {
      id: true,
      order: {
        select: {
          id: true,
          status: true,
          subOrders: {
            select: {
              id: true,
              shipments: { select: { status: true } },
            },
          },
        },
      },
    },
  },
} as const satisfies Prisma.ShipmentSelect;

export type UpdateOpts = {
  location?: string;
  note?: string;
  allowBackward?: boolean;
};
