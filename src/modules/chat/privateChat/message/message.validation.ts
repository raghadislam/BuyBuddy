import { z } from "zod";

import { ContentType, ReactionType } from "../../../../generated/prisma";
import { MatchType } from "../../../../enums/matchType.enum";

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

export const reactToMessageZodSchema = z.object({
  body: z
    .object({
      reactionType: z.nativeEnum(ReactionType),
    })
    .strict(),

  params: z
    .object({
      messageId: z.string().uuid({ message: "messageId must be a valid UUID" }),
    })
    .strict(),
});

export const attachmentSchema = z.object({
  url: z.string().url(),
  mimeType: z.string().optional(),
});

export const sendPrivateMessageZodSchema = z.object({
  body: z
    .object({
      content: z.string().min(1, "content is required"),

      contentType: z.nativeEnum(ContentType),

      attachments: z.array(attachmentSchema).optional(),
    })
    .strict(),

  params: z
    .object({
      conversationId: z
        .string()
        .min(1, "conversationId is required")
        .uuid({ message: "recipientId must be a valid UUID" }),
    })
    .strict(),
});

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

export const deleteForMeZodSchema = z.object({
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

export const deleteForAllZodSchema = deleteForMeZodSchema;

export const searchMessagesZodSchema = z.object({
  params: z
    .object({
      conversationId: z
        .string()
        .min(1, "conversationId is required")
        .uuid({ message: "conversationId must be a valid UUID" }),
    })
    .strict(),

  body: z
    .object({
      query: z.string().min(1, "Query string is required"),

      match: z.nativeEnum(MatchType).optional().default(MatchType.CONTAINS),

      caseSensitive: z.boolean().optional().default(false),
    })
    .strict(),

  query: z
    .object({
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
    })
    .strict(),
});
