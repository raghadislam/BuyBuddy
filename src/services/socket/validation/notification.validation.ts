import { z } from "zod";
import { NotificationType } from "@prisma/client";

export const sendSchema = z
  .object({
    type: z.nativeEnum(NotificationType, {
      error: "type is required and must be a valid NotificationType",
    }),

    title: z
      .string()
      .min(1, { message: "title is required and cannot be empty" }),

    body: z
      .string()
      .min(1, { message: "body is required and cannot be empty" }),

    data: z.any().optional(),

    recipientIds: z.array(
      z.string().uuid({ message: "each recipientId must be a valid UUID" })
    ),
  })
  .strict();

export const markReadSchema = z
  .object({
    notificationId: z
      .string()
      .uuid({ message: "notificationId is required and must be a valid UUID" }),
  })
  .strict();

export const deleteForMeSchema = z
  .object({
    notificationId: z
      .string()
      .uuid({ message: "notificationId is required and must be a valid UUID" }),
  })
  .strict();

export const searchSchema = z
  .object({
    query: z
      .string()
      .min(1, { message: "query is required and cannot be empty" }),

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
  .strict();
