import { z } from "zod";

export const searchByTextZodSchema = z.object({
  body: z.object({
    query: z.string().min(1, "Search query is required").max(500),
  }),
});
