import { Server } from "socket.io";
import { fromError } from "zod-validation-error";

import logger from "../../../../config/logger.config";
import { CustomSocket } from "../../../../services/socket/socket.type";
import messageService from "./message.service";
import { EVENTS } from "../../../../services/socket/socket.event";
import {
  conversationRoomName,
  joinConversationRoom,
} from "../../../../services/socket/utils/joinRooms.util";
import {
  ReactToPrivateMessage,
  SendPrivateMessagePayload,
  MarkMessageReadPayload,
  DeleteForMePayload,
  DeleteForAllPayload,
  SearchMessagesPayload,
  MarkAllMessagesDeliveredPayload,
} from "./message.type";
import {
  sendSchema,
  reactSchema,
  readSchema,
  deleteForMeSchema,
  deleteForAllSchema,
  searchSchema,
} from "../../../../services/socket/validation/message.validation";
import { validate } from "../../../../services/socket/utils/validate.util";

export default function messageGateway(io: Server, socket: CustomSocket) {
  const accountId = socket.data.accountId;
  if (!accountId) {
    logger.error("messageHandler: missing accountId", { socketId: socket.id });
    return;
  }

  socket.on(EVENTS.MESSAGE_SEND, async (rawPayload, ack) => {
    try {
      let data;
      try {
        data = validate(sendSchema, rawPayload);
      } catch (err) {
        const error = fromError(err);
        return ack({ status: "error", message: error.message });
      }

      const payload: SendPrivateMessagePayload = {
        accountId,
        conversationId: data.conversationId,
        content: data.content,
        contentType: data.contentType,
        attachments: data.attachments ?? [],
      };

      const result = await messageService.sendMessage(payload);

      await joinConversationRoom(socket, data.conversationId);
      socket
        .to(conversationRoomName(payload.conversationId))
        .emit(EVENTS.MESSAGE_SENT, result);

      ack({ status: "ok", data: result });
    } catch (err: any) {
      logger.error("message:send failed", {
        err,
        accountId,
        payload: rawPayload,
        socketId: socket.id,
      });
      ack({
        status: "error",
        message: err?.message ?? "Failed to send message",
      });
    }
  });

  socket.on(EVENTS.MESSAGE_REACT, async (rawPayload, ack) => {
    try {
      let data;
      try {
        data = validate(reactSchema, rawPayload);
      } catch (err) {
        const error = fromError(err);
        return ack({ status: "error", message: error.message });
      }

      const payload: ReactToPrivateMessage = {
        accountId,
        messageId: data.messageId,
        reactionType: data.reactionType,
      };

      const result = await messageService.reactToMessage(payload);

      await joinConversationRoom(socket, data.conversationId);
      socket
        .to(conversationRoomName(data.conversationId))
        .emit(EVENTS.MESSAGE_REACTED, result);

      ack({ status: "ok", data: result });
    } catch (err: any) {
      logger.error("message:react failed", {
        err,
        accountId,
        payload: rawPayload,
      });
      ack({ status: "error", message: err?.message ?? "Failed to react" });
    }
  });

  socket.on(EVENTS.MESSAGE_READ, async (rawPayload, ack) => {
    try {
      let data;
      try {
        data = validate(readSchema, rawPayload);
      } catch (err) {
        const error = fromError(err);
        return ack({ status: "error", message: error.message });
      }

      const payload: MarkMessageReadPayload = {
        accountId,
        conversationId: data.conversationId,
        messageId: data.messageId,
      };

      const result = await messageService.markMessageRead(payload);

      await joinConversationRoom(socket, data.conversationId);
      socket
        .to(conversationRoomName(payload.conversationId))
        .emit(EVENTS.MESSAGE_READ, result);

      ack({ status: "ok", data: result });
    } catch (err: any) {
      logger.error("message:read failed", {
        err,
        accountId,
        payload: rawPayload,
      });
      ack({ status: "error", message: err?.message ?? "Failed to mark read" });
    }
  });

  socket.on(EVENTS.MESSAGE_DELETE_FOR_ME, async (rawPayload, ack) => {
    try {
      let data;
      try {
        data = validate(deleteForMeSchema, rawPayload);
      } catch (err) {
        const error = fromError(err);
        return ack({ status: "error", message: error.message });
      }

      const payload: DeleteForMePayload = {
        accountId,
        conversationId: data.conversationId,
        messageId: data.messageId,
      };

      const result = await messageService.deleteMessageForMe(payload);

      await joinConversationRoom(socket, data.conversationId);
      socket
        .to(conversationRoomName(payload.conversationId))
        .emit(EVENTS.MESSAGE_DELETED_FOR_ME, result);

      ack({ status: "ok", data: result });
    } catch (err: any) {
      logger.error("message:deleteForMe failed", {
        err,
        accountId,
        payload: rawPayload,
      });
      ack({ status: "error", message: err?.message ?? "Failed to delete" });
    }
  });

  socket.on(EVENTS.MESSAGE_DELETE_FOR_ALL, async (rawPayload, ack) => {
    try {
      let data;
      try {
        data = validate(deleteForAllSchema, rawPayload);
      } catch (err) {
        const error = fromError(err);
        return ack({ status: "error", message: error.message });
      }

      const payload: DeleteForAllPayload = {
        accountId,
        conversationId: data.conversationId,
        messageId: data.messageId,
      };

      const result = await messageService.deleteMessageForAll(payload);

      await joinConversationRoom(socket, data.conversationId);
      socket
        .to(conversationRoomName(payload.conversationId))
        .emit(EVENTS.MESSAGE_DELETED_FOR_ALL, result);

      ack({ status: "ok", data: result });
    } catch (err: any) {
      logger.error("message:deleteForAll failed", {
        err,
        accountId,
        payload: rawPayload,
      });
      ack({
        status: "error",
        message: err?.message ?? "Failed to delete for all",
      });
    }
  });

  socket.on(EVENTS.MESSAGE_SEARCH, async (rawPayload, ack) => {
    try {
      let data;
      try {
        data = validate(searchSchema, rawPayload);
      } catch (err) {
        const error = fromError(err);
        return ack({ status: "error", message: error.message });
      }

      const payload: SearchMessagesPayload = {
        accountId,
        conversationId: data.conversationId,
        query: data.query,
        match: data.match,
        caseSensitive: data.caseSensitive,
        limit: data.limit ? Number(data.limit) : 50,
        cursor: data.cursor ? String(data.cursor) : undefined,
      };

      const result = await messageService.searchMessagesByString(payload);

      ack({ status: "ok", data: result });
    } catch (err: any) {
      logger.error("message:search failed", {
        err,
        accountId,
        payload: rawPayload,
      });
      ack({ status: "error", message: err?.message ?? "Failed to search" });
    }
  });

  socket.on(
    EVENTS.MESSAGE_MARK_DELIVERED,
    async (rawPayload: { conversationId: string; messageId: string }, ack) => {
      try {
        const payload: MarkAllMessagesDeliveredPayload = {
          accountId,
        };

        const result = await messageService.markMessageRead({
          ...rawPayload,
          accountId,
        });
        await messageService.markAllMessagesDelivered(payload);

        // Emit to all connected devices of this account
        socket
          .to(conversationRoomName(rawPayload.conversationId))
          .emit(EVENTS.MESSAGE_DELIVERED, {
            result,
          });

        ack({ status: "ok", data: result });
      } catch (err: any) {
        logger.error("message:markAllDelivered failed", {
          err,
          accountId,
          payload: rawPayload,
        });
        ack({
          status: "error",
          message: err?.message ?? "Failed to mark all delivered",
        });
      }
    }
  );
}
