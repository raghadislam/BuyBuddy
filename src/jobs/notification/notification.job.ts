import { Job } from "bullmq";
import { notificationQueue } from "./notification.queue";
import { NotificationJobPayload } from "./notification.type";

const REMOVE_CONFIG = {
  removeOnComplete: false, // 1 hour
  removeOnFail: false, // 1 day
};

export async function addNotificationJob(
  name: string,
  data: NotificationJobPayload
): Promise<Job> {
  return await notificationQueue.add(name, data, {
    ...REMOVE_CONFIG,
    attempts: 50,
    backoff: { type: "exponential", delay: 1000 },
  });
}
