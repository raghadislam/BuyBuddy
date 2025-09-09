import prisma from "../../config/prisma.config";
import logger from "../../config/logger.config";
import APIError from "../../utils/APIError";
import { HttpStatus } from "../../enums/httpStatus.enum";
import {
  SendNotificationPayload,
  GetNotificationsPayload,
  MarkNotificationReadPayload,
  DeleteNotificationForMePayload,
  SearchNotificationsPayload,
} from "./notification.type";
import {
  sendNotificationSelect,
  getNotificationsSelect,
} from "./notification.select";
import { INotificationService } from "./notification.interface";
import { Status } from "@prisma/client";

class NotificationService implements INotificationService {
  async sendNotification(payload: SendNotificationPayload) {
    const { actorId, type, title, body, data, recipientIds } = payload;

    return prisma.$transaction(async (tx) => {
      // normalize and dedupe recipientIds early
      const uniqueRecipientIds =
        recipientIds && recipientIds.length > 0
          ? Array.from(new Set(recipientIds))
          : [];

      // If actor provided and recipientIds explicitly includes them => error
      if (
        actorId &&
        uniqueRecipientIds.length > 0 &&
        uniqueRecipientIds.includes(actorId)
      ) {
        throw new APIError(
          "Cannot send a notification to yourself.",
          HttpStatus.BadRequest
        );
      }

      // If no recipients after dedupe -> error
      if (uniqueRecipientIds.length === 0) {
        throw new APIError(
          "No recipients available for this notification.",
          HttpStatus.BadRequest
        );
      }

      // Verify recipients exist in DB and are active.
      const existingAccounts = await tx.account.findMany({
        where: {
          id: { in: uniqueRecipientIds },
          status: Status.ACTIVE,
        },
        select: { id: true },
      });

      const existingIds = new Set(existingAccounts.map((a) => a.id));
      const invalidIds = uniqueRecipientIds.filter(
        (id) => !existingIds.has(id)
      );

      if (invalidIds.length > 0) {
        // return a clear error listing which ids are invalid/missing/inactive
        throw new APIError(
          `The following recipient ids are invalid or not active: ${invalidIds.join(
            ", "
          )}`,
          HttpStatus.BadRequest
        );
      }

      // Build recipients create payload (all ids are validated)
      const recipientsToCreate = uniqueRecipientIds.map((accountId) => ({
        accountId,
      }));

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

  async markNotificationRead(payload: MarkNotificationReadPayload) {
    const { accountId, notificationId } = payload;

    const existing = await prisma.notificationRecipient.findUnique({
      where: { notificationId_accountId: { notificationId, accountId } },
      select: { id: true, readAt: true, deletedAt: true },
    });

    if (!existing || existing.deletedAt) {
      throw new APIError(
        "You are not authorized to read this notification",
        HttpStatus.Forbidden
      );
    }
    if (existing.readAt) {
      throw new APIError(
        "Notification already marked read",
        HttpStatus.Conflict
      );
    }

    return prisma.$transaction(async (tx) => {
      await tx.notificationRecipient.update({
        where: { id: existing.id },
        data: { readAt: new Date() },
      });

      const unreadCount = await tx.notificationRecipient.count({
        where: { accountId, readAt: null, deletedAt: null },
      });

      logger.info(
        `Account ${accountId} marked notification ${notificationId} read`
      );
      return { marked: 1, unreadCount };
    });
  }

  async deleteNotificationForMe(payload: DeleteNotificationForMePayload) {
    const { accountId, notificationId } = payload;

    const existing = await prisma.notificationRecipient.findUnique({
      where: { notificationId_accountId: { notificationId, accountId } },
      select: { id: true, deletedAt: true, readAt: true },
    });

    if (!existing || existing.deletedAt) {
      throw new APIError(
        "Notification not found for this account",
        HttpStatus.BadRequest
      );
    }

    return prisma.$transaction(async (tx) => {
      await tx.notificationRecipient.update({
        where: { id: existing.id },
        data: { deletedAt: new Date(), readAt: existing.readAt ?? new Date() },
      });

      const unreadCount = await tx.notificationRecipient.count({
        where: { accountId, readAt: null, deletedAt: null },
      });

      logger.info(
        `Account ${accountId} deleted notification ${notificationId} for themself`
      );
      return { deleted: true, unreadCount };
    });
  }

  async searchNotificationsByString(payload: SearchNotificationsPayload) {
    const { accountId, query, limit = 50, cursor } = payload;

    if (cursor) {
      const exists = await prisma.notificationRecipient.findUnique({
        where: { id: cursor },
        select: { id: true },
      });
      if (!exists) {
        throw new APIError("Invalid cursor", HttpStatus.BadRequest);
      }
    }

    const take = Math.min(Math.max(limit, 1), 100) + 1;

    const recipients = await prisma.notificationRecipient.findMany({
      where: {
        accountId,
        deletedAt: null,
        notification: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { body: { contains: query, mode: "insensitive" } },
          ],
        },
      },
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      take,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      include: { notification: true },
    });

    let nextCursor: string | null = null;
    if (recipients.length === take) {
      const extra = recipients.pop()!;
      nextCursor = extra.id;
    }

    return { total: recipients.length, items: recipients, nextCursor };
  }
}

export default new NotificationService();
