import prisma from "../../../../config/prisma.config";
import logger from "../../../../config/logger.config";
import { HttpStatus } from "../../../../enums/httpStatus.enum";
import APIError from "../../../../utils/APIError";
import {
  IGetOrCreatePrivateConversationPayload,
  IGetPrivateConversationPayload,
  IGetAllPrivateConversationsPayload,
  IPrivateConversation,
  IArchivePrivateConversation,
  IUnarchivePrivateConversation,
} from "./conversation.interface";
import { Role, Status } from "../../../../generated/prisma";
import { chatParticipantSelect } from "../../../auth/auth.select";

class PrivateConverstionService {
  private formatConversation(
    conversation: IPrivateConversation,
    accountId: string
  ) {
    const otherKey = "other";
    const participantsArr: any[] = conversation.participants ?? [];

    const mePartRaw =
      participantsArr.find((p) => p.accountId === accountId) ?? null;
    const otherPartRaw =
      participantsArr.find((p) => p.accountId !== accountId) ?? null;

    const participantsObj: any = {
      me: mePartRaw,
    };
    participantsObj[otherKey] = otherPartRaw;

    conversation.participants = participantsObj;
    return conversation;
  }

  private formatConversationsList(
    conversations: IPrivateConversation[],
    accountId: string
  ) {
    return conversations.map((c) => this.formatConversation(c, accountId));
  }

  /*
   * Find an existing private conversation between two accounts (accountId and recipientId)
   * that the requesting account can see (no deleted messages), or create one if it doesn't exist.
   */
  async getOrCreateConversation(
    payload: IGetOrCreatePrivateConversationPayload
  ) {
    const { accountId, recipientId } = payload;

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
    if (accountId === recipientId) {
      throw new APIError(
        "Cannot create a conversation with the same account.",
        HttpStatus.BadRequest
      );
    }

    const existing = await prisma.privateConversation.findFirst({
      where: {
        AND: [
          // ensure accountId is present as a participant
          { participants: { some: { accountId: accountId } } },

          // ensure recipientId is present as a participant
          { participants: { some: { accountId: recipientId } } },

          // ensure there are no participants outside the two IDs
          {
            participants: {
              every: { accountId: { in: [accountId, recipientId] } },
            },
          },
        ],
      },
      include: {
        // Include participants and their related account data for context.
        participants: {
          include: {
            account: chatParticipantSelect,
          },
        },

        // Include recent messages that are visible to the requesting account.
        messages: {
          where: {
            // Only messages that have a visibility row for this account and
            // where deletedAt is null (i.e., the account hasn't deleted them).
            visibilities: {
              some: {
                accountId: accountId,
                deletedAt: null,
              },
            },
          },
          include: {
            // For each message, include only the visibility row for the requester
            // to reduce payload size and show read/deleted metadata.
            visibilities: {
              where: { accountId: accountId },
              take: 1, // only need the requesting account's visibility
            },

            // Include any attachments associated with each message.
            attachments: true,

            // Include a small subset of fields for accounts who reacted to the message.
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
      return {
        conversation: this.formatConversation(
          existing as IPrivateConversation,
          accountId
        ),
        isNew: false,
      };
    }

    // No existing conversation was found: create a new conversation with both participants.
    const conversation = await prisma.privateConversation.create({
      data: {
        participants: {
          create: [
            {
              accountId: accountId, // create participant row for requesting account
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
            account: chatParticipantSelect,
          },
        },
      },
    });

    logger.info("Created new private conversation", {
      conversationId: conversation.id,
      participants: conversation.participants?.map((p) => p.accountId),
    });
    return {
      conversation: this.formatConversation(
        conversation as IPrivateConversation,
        accountId
      ),
      isNew: true,
    };
  }

  async getConversation(payload: IGetPrivateConversationPayload) {
    const { accountId, conversationId } = payload;

    const conversation = await prisma.privateConversation.findUnique({
      where: {
        id: conversationId,
        // ensure accountId is present as a participant
        participants: { some: { accountId: accountId } },
      },
      include: {
        // Include participants and their related account data for context.
        participants: {
          include: {
            account: chatParticipantSelect,
          },
        },

        // Include recent messages that are visible to the requesting account.
        messages: {
          where: {
            // Only messages that have a visibility row for this account and
            // where deletedAt is null (i.e., the account hasn't deleted them).
            visibilities: {
              some: {
                accountId: accountId,
                deletedAt: null,
              },
            },
          },
          include: {
            // For each message, include only the visibility row for the requester
            // to reduce payload size and show read/deleted metadata.
            visibilities: {
              where: { accountId: accountId },
              take: 1, // only need the requesting account's visibility
            },

            // Include any attachments associated with each message.
            attachments: true,

            // Include a small subset of fields for accounts who reacted to the message.
            reactedBy: { select: { id: true, name: true, email: true } },
          },

          // Order messages newest-first and limit to 50 for a simple page.
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });

    // Validate that the conversation exists and belongs to the requesting account
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
    return this.formatConversation(
      conversation as IPrivateConversation,
      accountId
    );
  }

  async getAllConversations(payload: IGetAllPrivateConversationsPayload) {
    const { accountId } = payload;
    const conversations = await prisma.privateConversation.findMany({
      where: {
        // ensure accountId is present as a participant
        participants: { some: { accountId: accountId } },
      },
      include: {
        // Include participants and their related account data for context.
        participants: {
          include: {
            account: chatParticipantSelect,
          },
        },

        // Include last messages that are visible to the requesting account.
        messages: {
          where: {
            // Only messages that have a visibility row for this account and
            // where deletedAt is null (i.e., the account hasn't deleted them).
            visibilities: {
              some: {
                accountId: accountId,
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
              where: { accountId: accountId },
              take: 1, // only need the requesting account's visibility
            },

            // Include a small subset of fields for accounts who reacted to the message.
            reactedBy: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    logger.info(`Found private conversations for accountId: ${accountId}`);
    return this.formatConversationsList(
      conversations as IPrivateConversation[],
      accountId
    );
  }

  async archiveConversation(payload: IArchivePrivateConversation) {
    const { accountId, conversationId } = payload;

    const conversation = await prisma.privateConversation.findUnique({
      where: {
        id: conversationId,
        participants: { some: { accountId: accountId } },
      },
    });

    if (!conversation)
      throw new APIError(
        "You are not authorized to access this conversation or it does not exist",
        HttpStatus.Forbidden
      );

    console.log(conversation.archivedAt);
    if (conversation.archivedAt) {
      throw new APIError(
        "This conversation is already archived",
        HttpStatus.Conflict
      );
    }

    logger.info(`Archived private conversation with id: ${conversationId}`);
    return prisma.privateConversation.update({
      where: { id: conversationId },
      data: { archivedAt: new Date() },
    });
  }

  async unarchiveConversation(payload: IUnarchivePrivateConversation) {
    const { accountId, conversationId } = payload;

    const conversation = await prisma.privateConversation.findUnique({
      where: {
        id: conversationId,
        participants: { some: { accountId: accountId } },
      },
    });

    if (!conversation)
      throw new APIError(
        "You are not authorized to access this conversation or it does not exist",
        HttpStatus.Forbidden
      );

    // If it's not archived, can't unarchive
    if (!conversation.archivedAt) {
      throw new APIError(
        "This conversation is not archived",
        HttpStatus.Conflict
      );
    }

    logger.info(`Unarchived private conversation with id: ${conversationId}`);
    return prisma.privateConversation.update({
      where: { id: conversationId },
      data: { archivedAt: null },
    });
  }
}

export default new PrivateConverstionService();
