import { z } from "zod";
import { ShipmentStatus } from "@prisma/client";

export const updateShipmentStatusSchema = z.object({
  body: z.object({
    shipmentId: z.string().uuid(),
    next: z.enum(ShipmentStatus),
    addressId: z.string().uuid(),
    opt: z.object({
      note: z.string(),
      allowBackward: z.boolean(),
    }),
  }),
});
