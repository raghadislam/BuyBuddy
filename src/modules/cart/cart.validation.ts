import { z } from "zod";

export const addItemZodSchema = z.object({
  body: z.object({
    variantId: z.string().uuid("Invalid variant ID format"),
    qty: z.number().int().positive("Quantity must be a positive integer"),
  }),
});
