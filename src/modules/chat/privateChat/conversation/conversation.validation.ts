import { z } from "zod";

export const getOrCreatePrivateConversationZodSchema = z.object({
  params: z
    .object({
      recipientId: z
        .string()
        .uuid({ message: "recipientId must be a valid UUID" }),
    })
    .strict(),
});

export const getPrivateConversationZodSchema = z.object({
  params: z
    .object({
      conversationId: z
        .string()
        .uuid({ message: "conversationId must be a valid UUID" }),
    })
    .strict(),
});
