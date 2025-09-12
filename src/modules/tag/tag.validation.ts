import { z } from "zod";

export const attachTagBodyZodSchema = z.object({
  body: z.object({
    nameOrSlug: z.string().min(1),
    pinned: z.boolean().optional(),
  }),
});

export const attachTagsBulkBodyZodSchema = z.object({
  body: z.object({
    tags: z.array(
      z.object({
        nameOrSlug: z.string().min(1),
        pinned: z.boolean().optional(),
      })
    ),
  }),
});

export const togglePinnedBodyZodSchema = z.object({
  body: z.object({ pinned: z.boolean() }),
});

export const tagsBrowseQueryZodSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
  }),
});
