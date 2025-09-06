import { ReactionType, ContentType } from "../../../../generated/prisma";
import { SendMessageAttachment } from "../messageAttachment/messageAttachment.type";
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
