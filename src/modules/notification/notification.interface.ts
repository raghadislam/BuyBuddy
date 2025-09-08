import { Prisma } from "../../generated/prisma";
import {
  SendNotificationPayload,
  GetNotificationsPayload,
} from "./notification.type";

import {
  sendNotificationSelect,
  getNotificationsSelect,
} from "./notification.select";

export type SendNotificationResult = Prisma.NotificationGetPayload<{
  select: typeof sendNotificationSelect;
}>;

export type GetNotificationResult = Prisma.NotificationRecipientGetPayload<{
  select: typeof getNotificationsSelect;
}>;

export interface INotificationService {
  getNotifications(
    payload: GetNotificationsPayload
  ): Promise<{ items: GetNotificationResult[]; nextCursor: string | null }>;

  sendNotification(
    payload: SendNotificationPayload
  ): Promise<{
    recipientsCreated: number;
    notification: SendNotificationResult;
  }>;
}
