import { z } from "zod";

import { ContentType, ReactionType } from "@prisma/client";
import { MatchType } from "../../../enums/matchType.enum";

export const attachmentSchema = z.object({
  url: z.string().url(),
  mimeType: z.string().optional(),
});

export const sendSchema = z
  .object({
    conversationId: z
      .string()
      .min(1, "conversationId is required")
      .uuid({ message: "recipientId must be a valid UUID" }),

    content: z.string().min(1, "content is required"),

    contentType: z.nativeEnum(ContentType),

    attachments: z.array(attachmentSchema).optional(),
  })
  .strict();

export const reactSchema = z
  .object({
    messageId: z.string().uuid({ message: "messageId must be a valid UUID" }),

    conversationId: z
      .string()
      .min(1, "conversationId is required")
      .uuid({ message: "recipientId must be a valid UUID" }),

    reactionType: z.nativeEnum(ReactionType),
  })
  .strict();

export const markMessageReadZodSchema = z.object({
  params: z
    .object({
      conversationId: z
        .string()
        .min(1, "conversationId is required")
        .uuid({ message: "conversationId must be a valid UUID" }),

      messageId: z
        .string()
        .min(1, "messageId is required")
        .uuid({ message: "messageId must be a valid UUID" }),
    })
    .strict(),
});

export const readSchema = z
  .object({
    conversationId: z
      .string()
      .min(1, "conversationId is required")
      .uuid({ message: "conversationId must be a valid UUID" }),

    messageId: z
      .string()
      .min(1, "messageId is required")
      .uuid({ message: "messageId must be a valid UUID" }),
  })
  .strict();

export const deleteForMeSchema = z
  .object({
    conversationId: z
      .string()
      .min(1, "conversationId is required")
      .uuid({ message: "conversationId must be a valid UUID" }),

    messageId: z
      .string()
      .min(1, "messageId is required")
      .uuid({ message: "messageId must be a valid UUID" }),
  })
  .strict();

export const deleteForAllSchema = deleteForMeSchema;

export const searchSchema = z.object({
  conversationId: z
    .string()
    .min(1, "conversationId is required")
    .uuid({ message: "conversationId must be a valid UUID" }),

  query: z.string().min(1, "Query string is required"),

  match: z.nativeEnum(MatchType).optional().default(MatchType.CONTAINS),

  caseSensitive: z.boolean().optional().default(false),

  cursor: z
    .string()
    .uuid({ message: "cursor must be a valid UUID" })
    .optional(),

  limit: z
    .preprocess((val) => {
      if (val === undefined || val === null || val === "") return undefined;
      return Number(val);
    }, z.number().int().min(1).max(100).optional())
    .default(50),
});
