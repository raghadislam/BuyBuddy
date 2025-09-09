import { z } from "zod";

export const joinSchema = z
  .object({
    conversationId: z
      .string()
      .min(1, "conversationId is required")
      .uuid({ message: "conversationId must be a valid UUID" }),
  })
  .strict();

export const leaveSchema = joinSchema;
