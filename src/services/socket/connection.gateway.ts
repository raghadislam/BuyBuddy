import { Server, Socket } from "socket.io";

import { CustomSocket } from "./socket.type";
import conversationGateway from "../../modules/chat/privateChat/conversation/conversation.gateway";
import messageGateway from "../../modules/chat/privateChat/message/message.gateway";
import notificationGateway from "../../modules/notification/notification.gateway";
import { joinRoomsOnConnect } from "./utils/joinRooms.util";
import logger from "../../config/logger.config";
import { HttpStatus } from "../../enums/httpStatus.enum";
import { EVENTS } from "./socket.event";
import messageService from "../../modules/chat/privateChat/message/message.service";

export default function connectionGateway(io: Server, socketRaw: Socket) {
  const socket = socketRaw as CustomSocket;
  const accountId = socket.data.accountId;

  // log a warning that the socket connected without an accountId
  if (!accountId) {
    logger.warn(
      `Connected socket missing accountId, disconnecting socketId: ${socket.id}`
    );

    // emit a namespaced error object so client can react (if desired)
    socket.emit("socketError", {
      message: "Connected socket missing accountId",
      statusCode: HttpStatus.Unauthorized,
    }); // notify the client that the socket is unauthorized

    // forcibly disconnect the socket and stop handling this connection
    return socket.disconnect(true);
  }

  logger.info(`User connected: ${accountId} (socket: ${socket.id})`);

  // join rooms the user is a participant of
  joinRoomsOnConnect(socket, accountId).catch((err) => {
    logger.error("Error joining conversation rooms", err);
    socket.emit("socketError", {
      message: "Error joining conversation rooms",
      statusCode: HttpStatus.InternalServerError,
    });
  });

  messageService.markAllMessagesDelivered({ accountId }).catch((err) => {
    logger.error("Error marking messages as delivered", err);
    socket.emit("socketError", {
      message: "Error marking messages as delivered",
      statusCode: HttpStatus.InternalServerError,
    });
  });

  // register join/leave
  conversationGateway(io, socket);

  // register message gateway
  messageGateway(io, socket);

  // register notification gateway
  notificationGateway;

  // notify others when this socket disconnects
  socket.on(EVENTS.DISCONNECT, (reason) => {
    for (const room of socket.rooms) {
      if (typeof room === "string" && room.startsWith("conversation:")) {
        socket.to(room).emit("userOffline", { accountId });
      }
    }
    logger.info("socket disconnected", { socketId: socket.id, reason });
  });

  socket.on("error", (err) => {
    logger.error("socket error", { socketId: socket.id, err });
  });
}
