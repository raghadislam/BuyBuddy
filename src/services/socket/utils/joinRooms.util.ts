import { CustomSocket } from "../socket.type";
import prisma from "../../../config/prisma.config";

export function conversationRoomName(conversationId: string) {
  return `conversation:${conversationId}`;
}

export async function joinRoomsOnConnect(
  socket: CustomSocket,
  accountId: string
) {
  const participants = await prisma.privateConversationParticipant.findMany({
    where: { accountId },
    select: { conversationId: true },
  });

  participants.forEach((p) =>
    socket.join(conversationRoomName(p.conversationId))
  );
}

export async function joinConversationRoom(
  socket: CustomSocket,
  conversationId: string
) {
  await socket.join(conversationRoomName(conversationId));
}

export async function leaveConversationRoom(
  socket: CustomSocket,
  conversationId: string
) {
  await socket.leave(conversationRoomName(conversationId));
}
