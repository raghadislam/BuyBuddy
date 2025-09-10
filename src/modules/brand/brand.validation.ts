import { z } from "zod";
import { Category, PaymentMethod } from "@prisma/client";

export const updateBrandProfileZodSchema = z.object({
  body: z
    .object({
      description: z.string().min(1, "Description cannot be empty").optional(),

      logo: z.string().url("Logo must be a valid URL").optional(),

      categories: z
        .array(z.nativeEnum(Category))
        .nonempty("At least one category is required")
        .refine(
          (vals) => vals.every((val) => Object.values(Category).includes(val)),
          { message: "Invalid category" }
        )
        .optional(),

      instagramUrl: z.string().url("Instagram URL must be valid").optional(),

      tiktokUrl: z.string().url("TikTok URL must be valid").optional(),

      ownerName: z
        .string()
        .min(2, "Owner name must be at least 2 characters")
        .max(50, "Owner name cannot exceed 50 characters")
        .optional(),

      ownerNationalId: z
        .string()
        .min(8, "National ID must be at least 8 characters")
        .max(20, "National ID cannot exceed 20 characters")
        .optional(),

      ownerPhone: z
        .string()
        .regex(/^\+?\d{7,15}$/, "Phone must be a valid international number")
        .optional(),

      businessPhone: z
        .string()
        .regex(/^\+?\d{7,15}$/, "Phone must be a valid international number")
        .optional(),

      crn: z
        .string()
        .min(3, "CRN must be at least 3 characters")
        .max(30, "CRN cannot exceed 30 characters")
        .optional(),

      taxId: z
        .string()
        .min(3, "Tax ID must be at least 3 characters")
        .max(30, "Tax ID cannot exceed 30 characters")
        .optional(),

      paymentMethods: z
        .array(z.nativeEnum(PaymentMethod))
        .nonempty("At least one payment method is required")
        .refine(
          (vals) =>
            vals.every((val) => Object.values(PaymentMethod).includes(val)),
          { message: "Invalid payment method" }
        )
        .optional(),
    })
    .strict(),
});
