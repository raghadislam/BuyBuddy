import { z } from "zod";
import { Gender } from "../../generated/prisma";

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
    })
    .strict(),
});
