import prisma from "../../config/prisma.config";
import logger from "../../config/logger.config";
import APIError from "../../utils/APIError";
import { HttpStatus } from "../../enums/httpStatus.enum";
import {
  SendNotificationPayload,
  GetNotificationsPayload,
} from "./notification.type";
import {
  sendNotificationSelect,
  getNotificationsSelect,
} from "./notification.select";
import { INotificationService } from "./notification.interface";

class NotificationService implements INotificationService {
  /**
   * Create a notification and recipients. If recipientIds is undefined -> create recipients for ALL active accounts.
   */
  async sendNotification(payload: SendNotificationPayload) {
    const { actorId, type, title, body, data, recipientIds } = payload;

    return prisma.$transaction(async (tx) => {
      // Build recipients
      let recipientsToCreate: { accountId: string }[] = [];

      if (recipientIds && recipientIds.length > 0) {
        // dedupe
        const unique = Array.from(new Set(recipientIds));
        recipientsToCreate = unique.map((accountId) => ({ accountId }));
      } else {
        // Broadcast: fetch all active accounts (careful on very large dbs)
        const accounts = await tx.account.findMany({
          where: { status: "ACTIVE" },
          select: { id: true },
        });
        recipientsToCreate = accounts.map((a) => ({ accountId: a.id }));
      }

      const notification = await tx.notification.create({
        data: {
          actorId,
          type,
          title,
          body,
          data,
          recipients: {
            create: recipientsToCreate.map((r) => ({
              accountId: r.accountId,
            })),
          },
        },

        select: sendNotificationSelect,
      });

      logger.info(
        `Notification ${notification.id} created, recipients: ${recipientsToCreate.length}`
      );
      return { recipientsCreated: recipientsToCreate.length, notification };
    });
  }

  async getNotifications(payload: GetNotificationsPayload) {
    const { accountId, cursor, since, limit = 50 } = payload;

    if (cursor) {
      const exists = await prisma.notificationRecipient.findUnique({
        where: { id: cursor },
        select: { id: true },
      });
      if (!exists) {
        throw new APIError(
          "Invalid cursor: recipient row not found",
          HttpStatus.BadRequest
        );
      }
    }

    const pageSize = Math.min(Math.max(limit, 1), 100);
    const take = pageSize + 1;

    const recipients = await prisma.notificationRecipient.findMany({
      where: {
        accountId,
        deletedAt: null,
        ...(since && {
          createdAt: { gte: since },
        }),
      },
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      take,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      select: getNotificationsSelect,
    });

    let nextCursor: string | null = null;
    if (recipients.length === take) {
      const extra = recipients.pop()!;
      nextCursor = extra.id;
    }

    return { items: recipients, nextCursor };
  }
}

export default new NotificationService();
