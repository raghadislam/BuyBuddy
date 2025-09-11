import { z } from "zod";
import { VoteType, ReportReason } from "@prisma/client";

export const createReviewSchema = z.object({
  body: z.object({
    rating: z.number().min(1).max(5),
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
  }),
});

export const updateReviewSchema = z.object({
  body: z.object({
    rating: z.number().min(1).max(5).optional(),
    title: z.string().max(100).nullable().optional(),
    content: z.string().min(1).max(3000).optional(),
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
  }),
});

export const voteSchema = z.object({
  body: z.object({
    type: z.enum(VoteType),
  }),
});

export const reportSchema = z.object({
  body: z.object({
    reason: z.enum(ReportReason),
  }),
});

export const replySchema = z.object({
  body: z.object({
    content: z.string().min(1).max(3000),
  }),
});

export type CreateReviewDTO = z.infer<typeof createReviewSchema>;
export type UpdateReviewDTO = z.infer<typeof updateReviewSchema>;
