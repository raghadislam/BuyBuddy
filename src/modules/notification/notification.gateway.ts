import { Server } from "socket.io";
import { fromError } from "zod-validation-error";
import logger from "../../config/logger.config";
import { CustomSocket } from "../../services/socket/socket.type";
import notificationService from "./notification.service";
import { EVENTS } from "../../services/socket/socket.event";
import { validate } from "../../services/socket/utils/validate.util";
import { accountRoomName } from "../../services/socket/utils/joinRooms.util";
import { sendSchema } from "../../services/socket/validation/notification.validation";
import { SendNotificationPayload } from "./notification.type";

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

      // emit to recipients if present in this node
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
}
