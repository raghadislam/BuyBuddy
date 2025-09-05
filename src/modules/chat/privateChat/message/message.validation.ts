import { z } from "zod";

export const getPrivateMessagesZodSchema = z.object({
  params: z
    .object({
      conversationId: z
        .string()
        .min(1, "conversationId is required")
        .uuid({ message: "recipientId must be a valid UUID" }),
    })
    .strict(),
  query: z
    .object({
      cursor: z
        .string()
        .uuid({ message: "cursor must be a valid UUID" })
        .optional(),

      since: z
        .string()
        .optional()
        .refine((s) => !s || !Number.isNaN(Date.parse(s)), {
          message: "since must be a valid date string (ISO recommended)",
        }),

      limit: z
        .preprocess((val) => {
          if (val === undefined || val === null || val === "") return undefined;
          return Number(val);
        }, z.number().int().min(1).max(100).optional())
        .default(50),
    })
    .strict(),
});
