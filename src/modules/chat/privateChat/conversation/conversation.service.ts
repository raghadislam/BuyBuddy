import prisma from "../../../../config/prisma.config";
import logger from "../../../../config/logger.config";
import { HttpStatus } from "../../../../enums/httpStatus.enum";
import APIError from "../../../../utils/APIError";
import {
  IGetOrCreatePrivateConversation,
  IGetPrivateConversation,
  IGetAllPrivateConversations,
} from "./conversation.interface";
import { Status } from "../../../../generated/prisma";

class PrivateConverstionService {
  /*
   * Find an existing private conversation between two accounts (userId and recipientId)
   * that the requesting user can see (no deleted messages), or create one if it doesn't exist.
   */
  async getOrCreateConversation(payload: IGetOrCreatePrivateConversation) {
    const { userId, recipientId } = payload;

    // validate recipient exists
    const recipient = await prisma.account.findUnique({
      where: { id: recipientId },
    });
    if (!recipient) {
      throw new APIError("Recipient not found.", HttpStatus.NotFound);
    }

    // validate recipient active
    if (recipient.status !== Status.ACTIVE)
      throw new APIError("Recipient not available.", HttpStatus.BadRequest);

    // Disallow creating a conversation with the same account ID.
    if (userId === recipientId) {
      throw new APIError(
        "Cannot create a conversation with the same account.",
        HttpStatus.BadRequest
      );
    }

    const existing = await prisma.privateConversation.findFirst({
      where: {
        AND: [
          // ensure userId is present as a participant
          { participants: { some: { accountId: userId } } },

          // ensure recipientId is present as a participant
          { participants: { some: { accountId: recipientId } } },

          // ensure there are no participants outside the two IDs
          {
            participants: {
              every: { accountId: { in: [userId, recipientId] } },
            },
          },
        ],
      },
      include: {
        // Include participants and their related account data for context.
        participants: {
          include: {
            account: true,
          },
        },

        // Include recent messages that are visible to the requesting user.
        messages: {
          where: {
            // Only messages that have a visibility row for this user and
            // where deletedAt is null (i.e., the user hasn't deleted them).
            visibilities: {
              some: {
                accountId: userId,
                deletedAt: null,
              },
            },
          },
          include: {
            // For each message, include only the visibility row for the requester
            // to reduce payload size and show read/deleted metadata.
            visibilities: {
              where: { accountId: userId },
              take: 1, // only need the requesting user's visibility
            },

            // Include any attachments associated with each message.
            attachments: true,

            // Include a small subset of fields for users who reacted to the message.
            reactedBy: { select: { id: true, name: true, email: true } },
          },

          // Order messages newest-first and limit to 50 for a simple page.
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });

    // If we found a conversation return it
    if (existing) {
      logger.info("Found existing private conversation", {
        conversationId: existing.id,
        participants: existing.participants?.map((p) => p.accountId),
        messagesCount: existing.messages?.length ?? 0,
      });
      return { conversation: existing, isNew: false }; // return the conversation object as-is
    }

    // No existing conversation was found: create a new conversation with both participants.
    const conversation = await prisma.privateConversation.create({
      data: {
        participants: {
          create: [
            {
              accountId: userId, // create participant row for requesting user
            },
            {
              accountId: recipientId, // create participant row for recipient
            },
          ],
        },
      },
      include: {
        // Return participants with their account info after creation.
        participants: {
          include: {
            account: true,
          },
        },
      },
    });

    logger.info("Created new private conversation", {
      conversationId: conversation.id,
      participants: conversation.participants?.map((p) => p.accountId),
    });
    return { conversation, isNew: true };
  }

  async getConversation(payload: IGetPrivateConversation) {
    const { userId, conversationId } = payload;

    const conversation = await prisma.privateConversation.findUnique({
      where: {
        id: conversationId,
        // ensure userId is present as a participant
        participants: { some: { accountId: userId } },
      },
      include: {
        // Include participants and their related account data for context.
        participants: {
          include: {
            account: true,
          },
        },

        // Include recent messages that are visible to the requesting user.
        messages: {
          where: {
            // Only messages that have a visibility row for this user and
            // where deletedAt is null (i.e., the user hasn't deleted them).
            visibilities: {
              some: {
                accountId: userId,
                deletedAt: null,
              },
            },
          },
          include: {
            // For each message, include only the visibility row for the requester
            // to reduce payload size and show read/deleted metadata.
            visibilities: {
              where: { accountId: userId },
              take: 1, // only need the requesting user's visibility
            },

            // Include any attachments associated with each message.
            attachments: true,

            // Include a small subset of fields for users who reacted to the message.
            reactedBy: { select: { id: true, name: true, email: true } },
          },

          // Order messages newest-first and limit to 50 for a simple page.
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });

    // Validate that the conversation exists and belongs to the requesting user
    if (!conversation) {
      throw new APIError(
        "You are not authorized to access this conversation or it does not exist",
        HttpStatus.Forbidden
      );
    }

    logger.info("Found private conversation", {
      conversationId: conversation.id,
      participants: conversation.participants?.map((p) => p.accountId),
      messagesCount: conversation.messages?.length ?? 0,
    });
    return conversation;
  }

  async getAllConversations(payload: IGetAllPrivateConversations) {
    const { userId } = payload;
    const conversations = await prisma.privateConversation.findMany({
      where: {
        // ensure userId is present as a participant
        participants: { some: { accountId: userId } },
      },
      include: {
        // Include participants and their related account data for context.
        participants: {
          include: {
            account: {
              select: {
                id: true,
                name: true,
                email: true,
                brand: { select: { logo: true } },
                user: { select: { photo: true } },
              },
            },
          },
        },

        // Include last messages that are visible to the requesting user.
        messages: {
          where: {
            // Only messages that have a visibility row for this user and
            // where deletedAt is null (i.e., the user hasn't deleted them).
            visibilities: {
              some: {
                accountId: userId,
                deletedAt: null,
              },
            },
          },

          // Order messages newest-first and take only one.
          orderBy: { createdAt: "desc" },
          take: 1,

          include: {
            // For each message, include only the visibility row for the requester
            // to reduce payload size and show read/deleted metadata.
            visibilities: {
              where: { accountId: userId },
              take: 1, // only need the requesting user's visibility
            },

            // Include a small subset of fields for users who reacted to the message.
            reactedBy: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    logger.info(`Found private conversations for userID: ${userId}`);
    return conversations;
  }
}

export default new PrivateConverstionService();
