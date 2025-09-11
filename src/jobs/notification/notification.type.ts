export type NotificationJobName = "sendToAccount" | "sendToTopic";

export interface BaseNotificationPayload {
  title: string;
  body: string;
}

export interface SendToAccountPayload extends BaseNotificationPayload {
  accountId: string;
}

export interface SendToTopicPayload extends BaseNotificationPayload {
  topic: string;
}

export type NotificationJobPayload = SendToAccountPayload | SendToTopicPayload;
