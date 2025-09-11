import { emailWorker } from "./email/email.worker";
import { notificationWorker } from "./notification/notification.worker";

notificationWorker();
emailWorker();
