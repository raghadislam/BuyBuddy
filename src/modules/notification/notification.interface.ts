import {
  SendNotificationPayload,
  GetNotificationsPayload,
  MarkNotificationReadPayload,
  DeleteNotificationForMePayload,
  SearchNotificationsPayload,
  SearchNotificationsResult,
  GetNotificationResult,
  SendNotificationResult,
} from "./notification.type";

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

  deleteNotificationForMe(
    payload: DeleteNotificationForMePayload
  ): Promise<{ deleted: boolean; unreadCount: number }>;

  searchNotificationsByString(
    payload: SearchNotificationsPayload
  ): Promise<SearchNotificationsResult>;
}
