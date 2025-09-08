import { Account } from "../auth/auth.type";
import { NotificationType } from "../../generated/prisma";

export type Notification = {
  id: string;
  actor?: Account;
  actorId?: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: JSON;
  createdAt: Date;
  updatedAt: Date;
  recipients: NotificationRecipient;
};

export type NotificationRecipient = {
  id: string;
  notification: Notification;
  notificationId: string;
  account: Account;
  accountId: string;
  readAt?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type SendNotificationPayload = {
  actorId?: string | null;
  type: NotificationType;
  title: string;
  body: string;
  data?: any;
  recipientIds?: string[];
};

export type GetNotificationsPayload = {
  accountId: string;
  cursor?: string;
  limit?: number;
  since?: Date;
};

export type MarkNotificationReadPayload = {
  accountId: string;
  notificationId: string;
};

export type DeleteNotificationForMePayload = {
  accountId: string;
  notificationId: string;
};
