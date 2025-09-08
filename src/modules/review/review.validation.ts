import { z } from "zod";

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  content: z.string().min(10).max(3000),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        altText: z.string().max(120).optional(),
        sortOrder: z.number().int().min(0).optional(),
      })
    )
    .max(6)
    .optional(),
});

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().max(100).nullable().optional(),
  content: z.string().min(10).max(3000).optional(),
  images: z
    .array(
      z.object({
        id: z.string().uuid().optional(), // if existing
        url: z.string().url(),
        altText: z.string().max(120).optional(),
        sortOrder: z.number().int().min(0).optional(),
      })
    )
    .max(6)
    .optional(),
});

export const voteSchema = z.object({
  type: z.enum(["UP", "DOWN"]),
});

export const reportSchema = z.object({
  reason: z.string().min(5).max(500),
});

export type CreateReviewDTO = z.infer<typeof createReviewSchema>;
export type UpdateReviewDTO = z.infer<typeof updateReviewSchema>;
