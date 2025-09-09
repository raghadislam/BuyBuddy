import { Server } from "socket.io";
import { fromError } from "zod-validation-error";

import { CustomSocket } from "../../../../services/socket/socket.type";
import prisma from "../../../../config/prisma.config";
import logger from "../../../../config/logger.config";
import APIError from "../../../../utils/APIError";
import { HttpStatus } from "../../../../enums/httpStatus.enum";
import { EVENTS } from "../../../../services/socket/socket.event";
import {
  joinConversationRoom,
  leaveConversationRoom,
} from "../../../../services/socket/utils/joinRooms.util";
import {
  joinSchema,
  leaveSchema,
} from "../../../../services/socket/validation/conversation.validation";
import { validate } from "../../../../services/socket/utils/validate.util";

export default async function conversationGateway(
  io: Server,
  socket: CustomSocket
) {
  socket.on(EVENTS.CONVERSATION_JOIN, async (payload, ack) => {
    try {
      let data;
      try {
        data = validate(joinSchema, payload);
      } catch (err) {
        const error = fromError(err);
        return ack({ status: "error", message: error.message });
      }

      const { conversationId } = data;
      const { accountId } = socket.data;

      const participant =
        await prisma.privateConversationParticipant.findUnique({
          where: { conversationId_accountId: { conversationId, accountId } },
        });

      if (participant) {
        await joinConversationRoom(socket, conversationId); // join the socket to the conversation room
        socket
          .to(`conversation:${conversationId}`)
          .emit("userOnline", { accountId }); // notify other sockets in the room that this user is online
      } else {
        const apiErr = new APIError(
          "Not a participant of the conversation",
          HttpStatus.Forbidden
        );
        logger.warn("joinConversation rejected", {
          accountId,
          conversationId,
          error: apiErr,
        });

        ack({
          status: "error",
          message: apiErr.message,
          statusCode: apiErr.statusCode,
        });
      }

      ack({ status: "ok", data: { conversationId } });
    } catch (err) {
      const apiErr = new APIError(
        "joinConversation error",
        HttpStatus.InternalServerError
      );
      logger.error("conversation:join failed", {
        err,
        socketId: socket.id,
      });
      ack({
        status: "error",
        message: apiErr.message,
        statusCode: apiErr.statusCode,
      });
    }
  });

  socket.on(EVENTS.CONVERSATION_LEAVE, async (payload, ack) => {
    try {
      let data;
      try {
        data = validate(leaveSchema, payload);
      } catch (err) {
        const error = fromError(err);
        return ack({ status: "error", message: error.message });
      }

      const { conversationId } = data;

      await leaveConversationRoom(socket, conversationId);
      ack({ status: "ok", data: { conversationId } });
    } catch (err: any) {
      const apiErr = new APIError(
        "leaveConversation error",
        HttpStatus.InternalServerError
      );
      logger.error("conversation:leave failed", {
        err,
        socketId: socket.id,
      });
      ack({
        status: "error",
        message: apiErr.message,
        statusCode: apiErr.statusCode,
      });
    }
  });
}
