import { Job } from "bullmq";
import logger from "../../config/logger.config";
import APIError from "../../utils/APIError";
import { HttpStatus } from "../../enums/httpStatus.enum";
import {
  NotificationJobName,
  NotificationJobPayload,
  SendToAccountPayload,
  SendToTopicPayload,
} from "./notification.type";

import fcmService from "../../services/firebase/fcm/fcm.service";

export async function notificationProcessor(job: Job) {
  const name = job.name as NotificationJobName;
  const data = job.data as NotificationJobPayload;

  try {
    logger.info(`Processing notification job ${job.id} / ${name}`, {
      attemptsMade: job.attemptsMade,
    });

    switch (name) {
      case "sendToAccount": {
        const payload = data as SendToAccountPayload;
        if (!payload.accountId || !payload.title || !payload.body) {
          throw new APIError(
            "Missing `accountId`, `title` or `body` for sendToAccount",
            HttpStatus.BadRequest
          );
        }

        await fcmService.sendToAccount({
          accountId: payload.accountId,
          title: payload.title,
          body: payload.body,
        });

        break;
      }

      case "sendToTopic": {
        const payload = data as SendToTopicPayload;
        if (!payload.topic || !payload.title || !payload.body) {
          throw new APIError(
            "Missing `topic`, `title` or `body` for sendToTopic",
            HttpStatus.BadRequest
          );
        }

        await fcmService.sendToTopic({
          topic: payload.topic,
          title: payload.title,
          body: payload.body,
        });

        break;
      }

      default:
        throw new APIError(
          `Unknown notification job name: ${name}`,
          HttpStatus.BadRequest
        );
    }

    logger.info(`Notification job ${job.id} (${name}) done`);
  } catch (err) {
    throw err;
  }
}
