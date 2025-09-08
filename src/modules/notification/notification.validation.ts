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

  recipientIds: z
    .array(
      z.string().uuid({ message: "each recipientId must be a valid UUID" })
    )
    .optional(),
});

export const sendNotificationZodSchema = z.object({
  body: notificationPayload.strict(),
});
