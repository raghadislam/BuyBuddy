import { ReactionType, ContentType } from "../../../../generated/prisma";
import { SendMessageAttachment } from "../messageAttachment/messageAttachment.type";

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
