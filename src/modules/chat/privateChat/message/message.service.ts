import prisma from "../../../../config/prisma.config";
import logger from "../../../../config/logger.config";
import { HttpStatus } from "../../../../enums/httpStatus.enum";
import APIError from "../../../../utils/APIError";
import { IGetPrivateMessages, IPrivateMessage } from "./message.interface";
import {
  ReactToPrivateMessage,
  SendPrivateMessagePayload,
  MarkMessageReadPayload,
  DeleteForMePayload,
  DeleteForAllPayload,
  SearchMessagesPayload,
} from "./message.type";
import { MatchType } from "../../../../enums/matchType.enum";

class PrivateMessage {
  private wordContainsSubstring(
    content: string,
    query: string,
    caseSensitive = false
  ): boolean {
    const q = caseSensitive ? query : query.toLowerCase();
    const words = content.split(/\s+/);
    return words.some((w) => {
      const word = caseSensitive ? w : w.toLowerCase();
      return word.includes(q);
    });
  }

  private buildContentFilter(
    query: string,
    match: MatchType,
    caseSensitive: boolean
  ) {
    const mode = caseSensitive ? undefined : "insensitive";
    switch (match) {
      case MatchType.EXACT:
        return { equals: query, mode };
      case MatchType.STARTSWITH:
        return { startsWith: query, mode };
      case MatchType.ENDSWITH:
        return { endsWith: query, mode };
      case MatchType.CONTAINS:
      default:
        return { contains: query, mode };
    }
  }

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

  async deleteMessageForMe(payload: DeleteForMePayload) {
    const { accountId, conversationId, messageId } = payload;

    // verify participant exists and fetch current unreadCount
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
        "You are not authorized to delete messages in this conversation or it does not exist",
        HttpStatus.Forbidden
      );
    }

    // mark visibility.deletedAt for this user, unreadCount if needed.
    return prisma.$transaction(async (tx) => {
      // ensure message exists and belongs to conversation
      const message = await tx.privateMessage.findUnique({
        where: { id: messageId },
        select: { id: true, conversationId: true },
      });
      if (!message) {
        throw new APIError("Message not found", HttpStatus.BadRequest);
      }
      if (message.conversationId !== conversationId) {
        throw new APIError(
          "Message does not belong to this conversation",
          HttpStatus.BadRequest
        );
      }

      // Find existing visibility rows that would be affected for this user
      const visibilitie = await tx.privateMessageVisibility.findUnique({
        where: {
          messageId_accountId: { messageId, accountId },
        },
        select: {
          id: true,
          readAt: true,
          deletedAt: true,
        },
      });

      if (!visibilitie || visibilitie.deletedAt) {
        throw new APIError(
          "You are not authorized to read this message",
          HttpStatus.Forbidden
        );
      }

      let deletedCount = 1;
      let unreadDecrement = 0;

      const updateResult = await tx.privateMessageVisibility.update({
        where: { id: visibilitie.id },
        data: {
          deletedAt: new Date(),
          readAt: visibilitie.readAt ?? new Date(),
        },
      });

      if (!visibilitie.readAt) {
        unreadDecrement = 1;
      }

      // adjust unreadCount atomically
      const currentUnread = participant.unreadCount ?? 0;
      const newUnread = Math.max(0, currentUnread - unreadDecrement);

      await tx.privateConversationParticipant.update({
        where: {
          conversationId_accountId: { conversationId, accountId },
        },
        data: {
          unreadCount: newUnread,
        },
      });

      logger.info(
        `Deleted message ${messageId} for account ${accountId} in conversation ${conversationId}`
      );

      return {
        deleted: true,
        deletedCount,
        unreadCount: newUnread,
      };
    });
  }

  async deleteMessageForAll(payload: DeleteForAllPayload) {
    const { accountId, conversationId, messageId } = payload;

    // verify participant exists
    const requesterParticipant =
      await prisma.privateConversationParticipant.findUnique({
        where: {
          conversationId_accountId: { conversationId, accountId },
        },
        select: { unreadCount: true },
      });

    if (!requesterParticipant) {
      throw new APIError(
        "You are not authorized to delete messages in this conversation or it does not exist",
        HttpStatus.Forbidden
      );
    }

    return prisma.$transaction(async (tx) => {
      // load message and verify it belongs to conversation + get senderId + createdAt
      const message = await tx.privateMessage.findUnique({
        where: { id: messageId },
        select: {
          id: true,
          conversationId: true,
          createdAt: true,
          senderId: true,
        },
      });

      if (!message) {
        throw new APIError("Message not found", HttpStatus.BadRequest);
      }
      if (message.conversationId !== conversationId) {
        throw new APIError(
          "Message does not belong to this conversation",
          HttpStatus.BadRequest
        );
      }

      // Only the sender can delete for all
      if (message.senderId !== accountId) {
        throw new APIError(
          "Only the message sender can delete this message for everyone",
          HttpStatus.Forbidden
        );
      }

      const now = new Date();
      const TEN_MINUTES_MS = 10 * 60 * 1000;

      // Fetch visibilities for this message
      const visibilities = await tx.privateMessageVisibility.findMany({
        where: { messageId },
        select: { id: true, accountId: true, readAt: true, deletedAt: true },
      });

      // Find the other participant's visibility (1:1 chat)
      const otherVisibility = visibilities.find(
        (v) => v.accountId !== accountId
      );

      if (!otherVisibility) {
        throw new APIError(
          "Conversation participant visibility missing for the other user",
          HttpStatus.BadRequest
        );
      }

      // If the other participant has read the message, compute how long ago they read it
      if (otherVisibility.readAt) {
        const seenAgoMs =
          now.getTime() - new Date(otherVisibility.readAt).getTime();

        // Treat negative as "just seen".
        const safeSeenAgoMs = Math.max(0, seenAgoMs);

        // If they saw it 10+ minutes ago, forbid delete-for-all
        if (safeSeenAgoMs >= TEN_MINUTES_MS) {
          throw new APIError(
            "Cannot delete for everyone: the other participant saw this message more than 10 minutes ago",
            HttpStatus.Forbidden
          );
        }
      }

      // Determine which visibility rows to update (skip already-deleted)
      const visToUpdate = visibilities.filter((v) => !v.deletedAt);

      // Update all visibility rows sequentially (safer inside the transaction)
      for (const v of visToUpdate) {
        await tx.privateMessageVisibility.update({
          where: { id: v.id },
          data: {
            deletedAt: now,
            readAt: v.readAt ?? now,
          },
        });
      }

      // Mark the message itself as deleted (deleted for everyone)
      await tx.privateMessage.update({
        where: { id: messageId },
        data: { deletedAt: now },
      });

      // Atomically adjust unreadCount for the other participant only (1:1 chat)
      let updatedUnreadCount: {
        accountId: string;
        unreadCount: number;
      } | null = null;

      // Only decrement if other hasn't read and their visibility wasn't already deleted
      if (!otherVisibility.deletedAt && !otherVisibility.readAt) {
        const participantRow =
          await tx.privateConversationParticipant.findUnique({
            where: {
              conversationId_accountId: {
                conversationId,
                accountId: otherVisibility.accountId,
              },
            },
            select: { unreadCount: true },
          });

        if (participantRow) {
          const currentUnread = participantRow.unreadCount ?? 0;
          const newUnread = Math.max(0, currentUnread - 1);

          await tx.privateConversationParticipant.update({
            where: {
              conversationId_accountId: {
                conversationId,
                accountId: otherVisibility.accountId,
              },
            },
            data: { unreadCount: newUnread },
          });

          updatedUnreadCount = {
            accountId: otherVisibility.accountId,
            unreadCount: newUnread,
          };
        }
      }

      logger.info(
        `Deleted message ${messageId} for all by account ${accountId} in conversation ${conversationId}`
      );

      return {
        deleted: true,
        updatedUnreadCount,
      };
    });
  }

  async searchMessagesByString(payload: SearchMessagesPayload) {
    const {
      accountId,
      conversationId,
      query,
      match = MatchType.CONTAINS,
      caseSensitive = false,
      limit = 50,
      cursor,
    } = payload;

    // verify participant exists
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
        "You are not part of this conversation",
        HttpStatus.Forbidden
      );
    }

    let messages;
    if (match === MatchType.WORDCONTAINS) {
      // fetch candidate messages from DB with a broad "contains"
      // We oversample (limit * 3) to ensure enough candidates after filtering
      const candidates = await prisma.privateMessage.findMany({
        where: {
          conversationId,
          deletedAt: null,
          visibilities: {
            some: {
              accountId: accountId,
              deletedAt: null,
            },
          },
          content: {
            contains: query,
            mode: caseSensitive ? undefined : "insensitive",
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit * 3,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        select: {
          id: true,
          senderId: true,
          content: true,
          createdAt: true,
        },
      });

      // Now refine results in memory using custom word matching
      messages = candidates
        .filter((m) =>
          this.wordContainsSubstring(m.content, query, caseSensitive)
        )
        .slice(0, limit);
    } else {
      const contentFilter = this.buildContentFilter(
        query,
        match,
        caseSensitive
      );
      messages = await prisma.privateMessage.findMany({
        where: {
          conversationId,
          deletedAt: null,
          content: contentFilter as any,
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        select: {
          id: true,
          senderId: true,
          content: true,
          createdAt: true,
        },
      });
    }

    return {
      total: messages.length,
      messages,
      nextCursor:
        messages.length === limit ? messages[messages.length - 1].id : null,
    };
  }
}

export default new PrivateMessage();
