import { z } from "zod";

export const addItemZodSchema = z.object({
  params: z.object({
    variantId: z.string().uuid("Invalid variant ID format"),
  }),

  body: z.object({
    qty: z.number().int().positive("Quantity must be a positive integer"),
  }),
});

export const updateItemZodSchema = z.object({
  params: z.object({
    variantId: z.string().uuid("Invalid variant ID format"),
  }),

  body: z.object({
    qty: z.number().int().min(0, "Quantity must be a non-negative integer"),
  }),
});

export const removeItemZodSchema = z.object({
  params: z.object({
    variantId: z.string().uuid("Invalid variant ID format"),
  }),
});
