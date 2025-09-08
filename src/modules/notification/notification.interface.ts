import { SendNotificationPayload } from "./notification.type";

export interface INotificationService {
  sendNotification(
    payload: SendNotificationPayload
  ): Promise<{ notification: any; recipientsCreated: number }>;
}
