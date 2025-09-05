import prisma from "../../../../config/prisma.config";
import logger from "../../../../config/logger.config";
import { HttpStatus } from "../../../../enums/httpStatus.enum";
import APIError from "../../../../utils/APIError";
import { IGetPrivateMessages } from "./message.interface";

class PrivateMessage {
  async getMessages(payload: IGetPrivateMessages) {
    const { accountId, conversationId, cursor, since, limit = 50 } = payload;

    const pageSize = Math.min(Math.max(limit, 1), 100);
    const take = pageSize + 1;

    const participant = await prisma.privateConversationParticipant.findUnique({
      where: {
        conversationId_accountId: { conversationId, accountId },
      },
    });
    if (!participant) {
      throw new APIError(
        "You are not authorized to access the messages of this conversation or it does not exist",
        HttpStatus.Forbidden
      );
    }

    const filters: any = {
      conversationId,
      visibilities: {
        some: {
          accountId: accountId,
          deletedAt: null,
        },
      },
    };
    if (since) {
      filters.createdAt = { gte: new Date(since) };
    }

    const messages = await prisma.privateMessage.findMany({
      where: filters,

      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      take,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],

      include: {
        attachments: true,
        visibilities: { where: { accountId } },
        reactedBy: { where: { id: accountId }, select: { id: true } },
      },
    });

    let nextCursor: string | null = null;
    if (messages.length === take) {
      const extra = messages.pop()!;
      nextCursor = extra.id;
    }

    logger.info(
      `Messages fetched successfully for conversation: ${conversationId}`
    );
    return { messages, nextCursor };
  }
}

export default new PrivateMessage();
