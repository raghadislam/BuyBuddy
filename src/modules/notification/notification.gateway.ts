import { Server } from "socket.io";
import { fromError } from "zod-validation-error";
import logger from "../../config/logger.config";
import { CustomSocket } from "../../services/socket/socket.type";
import notificationService from "./notification.service";
import { EVENTS } from "../../services/socket/socket.event";
import { validate } from "../../services/socket/utils/validate.util";
import { accountRoomName } from "../../services/socket/utils/joinRooms.util";
import {
  sendSchema,
  markReadSchema,
  deleteForMeSchema,
} from "../../services/socket/validation/notification.validation";
import {
  SendNotificationPayload,
  MarkNotificationReadPayload,
} from "./notification.type";

export default function notificationGateway(io: Server, socket: CustomSocket) {
  const accountId = socket.data.accountId;
  if (!accountId) {
    logger.error("notificationHandler: missing accountId", {
      socketId: socket.id,
    });
    return;
  }

  // Only server -> clients for new notifications.
  socket.on(EVENTS.NOTIFICATION_SEND, async (rawPayload, ack) => {
    try {
      let data;
      try {
        data = validate(sendSchema, rawPayload);
      } catch (err) {
        const error = fromError(err);
        return ack?.({ status: "error", message: error.message });
      }

      const payload: SendNotificationPayload = {
        actorId: accountId,
        type: data.type,
        title: data.title,
        body: data.body,
        data: data.data,
        recipientIds: data.recipientIds,
      };

      const result = await notificationService.sendNotification(payload);

      // emit to recipients if present
      if (data.recipientIds && data.recipientIds.length > 0) {
        data.recipientIds.forEach((rid: string) => {
          io.to(accountRoomName(rid)).emit(EVENTS.NOTIFICATION_SENT, result);
        });
      }

      ack?.({ status: "ok", data: result });
    } catch (err: any) {
      logger.error("notification:send failed", { err, accountId });
      ack?.({
        status: "error",
        message: err?.message ?? "Failed to send notification",
      });
    }
  });

  socket.on(EVENTS.NOTIFICATION_MARK_READ, async (rawPayload, ack) => {
    try {
      let data;
      try {
        data = validate(markReadSchema, rawPayload);
      } catch (err) {
        const error = fromError(err);
        return ack?.({ status: "error", message: error.message });
      }

      const payload: MarkNotificationReadPayload = {
        accountId,
        notificationId: data.notificationId,
      };

      const result = await notificationService.markNotificationRead(payload);

      socket.emit(EVENTS.NOTIFICATION_READ, {
        data,
        result,
      });

      ack?.({ status: "ok", data: result });
    } catch (err: any) {
      logger.error("notification:mark-read failed", { err, accountId });
      ack?.({
        status: "error",
        message: err?.message ?? "Failed to mark read",
      });
    }
  });

  socket.on(EVENTS.NOTIFICATION_DELETE_FOR_ME, async (rawPayload, ack) => {
    try {
      let data;
      try {
        data = validate(deleteForMeSchema, rawPayload);
      } catch (err) {
        const error = fromError(err);
        return ack?.({ status: "error", message: error.message });
      }

      const result = await notificationService.deleteNotificationForMe({
        accountId,
        notificationId: data.notificationId,
      });

      socket.emit(EVENTS.NOTIFICATION_DELETED_FOR_ME, {
        data,
        result,
      });

      ack?.({ status: "ok", data: result });
    } catch (err: any) {
      logger.error("notification:delete failed", { err, accountId });
      ack?.({
        status: "error",
        message: err?.message ?? "Failed to delete notification",
      });
    }
  });
}
