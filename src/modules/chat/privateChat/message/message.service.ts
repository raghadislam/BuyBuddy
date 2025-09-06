import prisma from "../../../../config/prisma.config";
import logger from "../../../../config/logger.config";
import { HttpStatus } from "../../../../enums/httpStatus.enum";
import APIError from "../../../../utils/APIError";
import { IGetPrivateMessages, IPrivateMessage } from "./message.interface";
import {
  ReactToPrivateMessage,
  SendPrivateMessagePayload,
  MarkMessageReadPayload,
} from "./message.type";

class PrivateMessage {
  async getMessages(payload: IGetPrivateMessages) {
    const { accountId, conversationId, cursor, since, limit = 50 } = payload;

    if (cursor) {
      const exists = await prisma.privateMessage.findUnique({
        where: { id: cursor },
        select: { id: true },
      });
      if (!exists) {
        throw new APIError(
          "Invalid cursor: message not found",
          HttpStatus.BadRequest
        );
      }
    }
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

  async reactToMessage(payload: ReactToPrivateMessage) {
    const { accountId, messageId, reactionType } = payload;

    const message = await prisma.privateMessage.findUnique({
      where: {
        id: messageId,
        visibilities: {
          some: { accountId, deletedAt: null },
        },
      },
    });

    if (!message) {
      throw new APIError(
        "You are not authorized to access this message or it does not exist",
        HttpStatus.Forbidden
      );
    }

    if (message.senderId === accountId) {
      throw new APIError(
        "You are not allowed to react to your own messages",
        HttpStatus.Forbidden
      );
    }

    // Toggle or update reaction
    const newMessage = await prisma.privateMessage.update({
      where: { id: messageId },
      data:
        reactionType === message.reactionType
          ? { reactedById: null, reactionType: null }
          : { reactedById: accountId, reactionType },
      select: {
        id: true,
        reactedById: true,
        reactionType: true,
      },
    });

    logger.info(
      `Message with id ${messageId} reacted by ${accountId} with ${reactionType}`
    );

    return newMessage;
  }

  async sendMessage(payload: SendPrivateMessagePayload) {
    const { accountId, conversationId, content, contentType, attachments } =
      payload;

    const participant = await prisma.privateConversationParticipant.findUnique({
      where: {
        conversationId_accountId: { conversationId, accountId },
      },
      select: { accountId: true },
    });

    if (!participant) {
      throw new APIError(
        "You are not authorized to send messages in this conversation or it does not exist",
        HttpStatus.Forbidden
      );
    }

    return prisma.$transaction(async (tx) => {
      // get participants to create visibilities
      const participants = await tx.privateConversationParticipant.findMany({
        where: {
          conversationId,
        },
      });

      // build visibilities data
      const visibilities = participants.map((p) => ({
        accountId: p.accountId,
        readAt: p.accountId === accountId ? new Date() : null,
      }));

      // create message
      const message = await tx.privateMessage.create({
        data: {
          content,
          contentType,
          conversationId,
          senderId: accountId,
          attachments: {
            create: attachments,
          },
          visibilities: {
            create: visibilities,
          },
        },
        include: {
          attachments: true,
          visibilities: true,
        },
      });

      // increment unreadCount for the other
      await tx.privateConversationParticipant.updateMany({
        where: { conversationId, accountId: { not: accountId } },
        data: { unreadCount: { increment: 1 } },
      });

      // reset sender unreadCount to 0
      await tx.privateConversationParticipant.update({
        where: {
          conversationId_accountId: { conversationId, accountId: accountId },
        },
        data: { unreadCount: 0 },
      });

      // update conversation timestamp
      await tx.privateConversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      logger.info(`Message with id ${message.id} created`);
      return message;
    });
  }

  async markMessageRead(payload: MarkMessageReadPayload) {
    const { conversationId, accountId, messageId } = payload;

    const participant = await prisma.privateConversationParticipant.findUnique({
      where: {
        conversationId_accountId: { conversationId, accountId },
      },
      select: {
        unreadCount: true,
      },
    });

    if (!participant) {
      throw new APIError(
        "You are not authorized to read messages in this conversation or it does not exist",
        HttpStatus.Forbidden
      );
    }

    return prisma.$transaction(async (tx) => {
      // validate message belongs to conversation
      const message = await tx.privateMessage.findUnique({
        where: { id: messageId },
        select: { conversationId: true },
      });
      if (!message) {
        throw new APIError("Invalid message ID", HttpStatus.BadRequest);
      }
      if (message.conversationId !== conversationId) {
        throw new APIError(
          "Message does not belong to this conversation",
          HttpStatus.BadRequest
        );
      }

      const existing = await tx.privateMessageVisibility.findUnique({
        where: { messageId_accountId: { messageId, accountId } },
      });

      if (!existing || existing.deletedAt) {
        throw new APIError(
          "You are not authorized to read this message",
          HttpStatus.Forbidden
        );
      }

      if (existing.readAt) {
        throw new APIError(
          "This message is already marked as read",
          HttpStatus.Conflict
        );
      }

      const result = await tx.privateMessageVisibility.update({
        where: { messageId_accountId: { messageId, accountId } },
        data: { readAt: new Date() },
      });

      const marked = 1;

      // adjust unreadCount (never below 0)
      const priorUnread = participant.unreadCount ?? 0;
      const newUnread = Math.max(0, priorUnread - marked);

      await tx.privateConversationParticipant.update({
        where: {
          conversationId_accountId: { conversationId, accountId },
        },
        data: {
          unreadCount: newUnread,
        },
      });

      logger.info(
        `Marked message ${messageId} of private conversation ${conversationId} as read for account ${accountId}`
      );
      return { marked, unreadCount: newUnread };
    });
  }
}

export default new PrivateMessage();
