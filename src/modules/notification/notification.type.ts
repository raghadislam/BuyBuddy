import { Account } from "../auth/auth.type";
import { NotificationType } from "@prisma/client";
import {
  sendNotificationSelect,
  getNotificationsSelect,
} from "./notification.select";
import { Prisma } from "@prisma/client";

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

export type SearchNotificationsPayload = {
  accountId: string;
  query: string;
  limit?: number;
  cursor?: string;
};

export type NotificationRecipientWithNotification =
  Prisma.NotificationRecipientGetPayload<{
    include: { notification: true };
  }>;

export type SendNotificationResult = Prisma.NotificationGetPayload<{
  select: typeof sendNotificationSelect;
}>;

export type GetNotificationResult = Prisma.NotificationRecipientGetPayload<{
  select: typeof getNotificationsSelect;
}>;

export type SearchNotificationsResult = {
  total: number;
  items: NotificationRecipientWithNotification[];
  nextCursor: string | null;
};
