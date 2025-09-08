import { Prisma } from "../../generated/prisma";
import {
  SendNotificationPayload,
  GetNotificationsPayload,
  MarkNotificationReadPayload,
} from "./notification.type";

import {
  sendNotificationSelect,
  getNotificationsSelect,
} from "./notification.select";

type SendNotificationResult = Prisma.NotificationGetPayload<{
  select: typeof sendNotificationSelect;
}>;

type GetNotificationResult = Prisma.NotificationRecipientGetPayload<{
  select: typeof getNotificationsSelect;
}>;

export interface INotificationService {
  getNotifications(
    payload: GetNotificationsPayload
  ): Promise<{ items: GetNotificationResult[]; nextCursor: string | null }>;

  sendNotification(payload: SendNotificationPayload): Promise<{
    recipientsCreated: number;
    notification: SendNotificationResult;
  }>;

  markNotificationRead(
    payload: MarkNotificationReadPayload
  ): Promise<{ marked: number; unreadCount: number }>;
}
