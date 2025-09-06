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

export const archiveConversationZodSchema = z.object({
  params: z
    .object({
      conversationId: z
        .string()
        .uuid({ message: "conversationId must be a valid UUID" }),
    })
    .strict(),
});

export const unarchiveConversationZodSchema = z.object({
  params: z
    .object({
      conversationId: z
        .string()
        .uuid({ message: "conversationId must be a valid UUID" }),
    })
    .strict(),
});

export const markReadZodSchema = z.object({
  params: z.object({
    conversationId: z
      .string()
      .min(1, "conversationId is required")
      .uuid({ message: "conversationId must be a valid UUID" }),
  }),
  query: z
    .object({
      upToMessageId: z
        .string()
        .uuid({ message: "upToMessageId must be a valid UUID" })
        .optional(),
    })
    .strict(),
});
