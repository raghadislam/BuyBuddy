import { z } from "zod";
import { Category, PaymentMethod } from "../../generated/prisma";

export const updateBrandProfileZodSchema = z.object({
  body: z.object({
    description: z.string().min(1, "Description cannot be empty").optional(),

    logo: z.string().url("Logo must be a valid URL").optional(),

    category: z
      .nativeEnum(Category)
      .refine((val) => Object.values(Category).includes(val), {
        message: "Invalid category",
      })
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
      .min(6, "Phone number must be at least 6 digits")
      .max(20, "Phone number cannot exceed 20 digits")
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

    paymentMethod: z
      .nativeEnum(PaymentMethod)
      .refine((val) => Object.values(PaymentMethod).includes(val), {
        message: "Invalid payment method",
      })
      .optional(),
  }),
});
