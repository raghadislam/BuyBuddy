import { z } from "zod";
import { NotificationType } from "../../generated/prisma";

export const notificationPayload = z.object({
  type: z.nativeEnum(NotificationType, {
    error: "type is required and must be a valid NotificationType",
  }),

  title: z
    .string()
    .min(1, { message: "title is required and cannot be empty" }),

  body: z.string().min(1, { message: "body is required and cannot be empty" }),

  data: z.any().optional(),

  recipientIds: z.array(
    z.string().uuid({ message: "each recipientId must be a valid UUID" })
  ),
});

export const sendNotificationZodSchema = z.object({
  body: notificationPayload.strict(),
});

export const getNotificationsZodSchema = z.object({
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
          message: "since must be a valid date string (ISO 8601 recommended)",
        }),

      limit: z
        .preprocess((val) => {
          if (val === undefined || val === null || val === "") return undefined;
          return Number(val);
        }, z.number().int().min(1, { message: "limit must be >= 1" }).max(100, { message: "limit must be <= 100" }).optional())
        .default(50),
    })
    .strict(),
});

export const markReadZodSchema = z.object({
  params: z
    .object({
      notificationId: z
        .string()
        .uuid({ message: "notificationId must be a valid UUID" }),
    })
    .strict(),
});

export const deleteForMeZodSchema = markReadZodSchema;

export const searchNotificationsZodSchema = z.object({
  body: z
    .object({
      query: z
        .string()
        .min(1, { message: "query is required and cannot be empty" }),
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
        }, z.number().int().min(1, { message: "limit must be >= 1" }).max(100, { message: "limit must be <= 100" }).optional())
        .default(50),
    })
    .strict(),
});
