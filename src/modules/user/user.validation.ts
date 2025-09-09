import { z } from "zod";
import { Gender, PaymentMethod } from "../../generated/prisma";

export const updateUserProfileZodSchema = z.object({
  body: z
    .object({
      userName: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(50, "Username must be at most 50 characters")
        .optional(),

      photo: z.string().url("Photo must be a valid URL").optional(),

      phone: z
        .string()
        .regex(/^\+?\d{7,15}$/, "Phone must be a valid international number")
        .optional(),

      gender: z.nativeEnum(Gender).optional(),

      city: z.string().min(1, "City cannot be empty").optional(),

      primaryAddress: z
        .string()
        .min(1, "Primary address cannot be empty")
        .optional(),

      secondaryAddress: z
        .string()
        .min(1, "Secondary address cannot be empty")
        .optional(),

      landmark: z.string().min(1, "Landmark cannot be empty").optional(),

      paymentMethods: z.array(z.nativeEnum(PaymentMethod)).optional(),

      birthDate: z
        .string()
        .refine((date) => !date || !Number.isNaN(Date.parse(date)), {
          message:
            "Date of birth must be a valid date string (ISO 8601 recommended)",
        })
        .optional(),

      government: z.string().min(1, "Government cannot be empty").optional(),
    })
    .strict(),
});
