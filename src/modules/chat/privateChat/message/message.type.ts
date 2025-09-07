import { PrivateConversation } from "../conversation/conversation.type";
import { Account } from "../../../auth/auth.type";
import {
  PrivateMessageAttachment,
  SendMessageAttachment,
} from "../messageAttachment/messageAttachment.type";
import { ContentType, ReactionType } from "../../../../generated/prisma";
import { PrivateMessageVisibility } from "../messageVisibility/messageVisibility.type";
import { MatchType } from "../../../../enums/matchType.enum";

export type ReactToPrivateMessage = {
  accountId: string;
  messageId: string;
  reactionType: ReactionType;
};

export type SendPrivateMessagePayload = {
  accountId: string;
  conversationId: string;
  content: string;
  contentType: ContentType;
  attachments?: SendMessageAttachment[];
};

export type MarkMessageReadPayload = {
  accountId: string;
  conversationId: string;
  messageId: string;
};

export type DeleteForMePayload = {
  accountId: string;
  conversationId: string;
  messageId: string;
};

export type DeleteForAllPayload = {
  accountId: string;
  conversationId: string;
  messageId: string;
};

export type SearchMessagesPayload = {
  accountId: string;
  conversationId: string;
  query: string;
  match?: MatchType;
  caseSensitive?: boolean;
  limit?: number;
  cursor?: string;
};

export type PrivateMessage = {
  id: string;
  conversation: PrivateConversation;
  conversationId: string;
  sender: Account;
  senderId: string;
  content?: string;
  contentType: ContentType;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  attachments: PrivateMessageAttachment[];
  reactionType?: ReactionType;
  reactedById?: string;
  reactedBy?: Account;
  visibilities: PrivateMessageVisibility[];
};

export type GetPrivateMessages = {
  accountId: string;
  conversationId: string;
  limit?: number;
  cursor?: string;
  since?: Date;
};
