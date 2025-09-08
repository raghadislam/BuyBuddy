import { PrivateConversationParticipant } from "../conversationParticipant/conversationParticipant.type";
import { PrivateMessage } from "../message/message.type";

export type PrivateConversation = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  archivedAt?: Date;
  participants: PrivateConversationParticipant[];
  messages: PrivateMessage[];
};

export type GetOrCreatePrivateConversationPayload = {
  accountId: string;
  recipientId: string;
};

export type GetPrivateConversationPayload = {
  accountId: string;
  conversationId: string;
};

export type GetAllPrivateConversationsPayload = {
  accountId: string;
};

export type AnyPrivateConversation = {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  archivedAt?: Date;
  participants?: PrivateConversationParticipant[];
  messages?: PrivateMessage[];
};

export type ArchivePrivateConversation = {
  accountId: string;
  conversationId: string;
};

export type UnarchivePrivateConversation = ArchivePrivateConversation;

export type MarkReadPayload = {
  accountId: string;
  conversationId: string;
  upToMessageId?: string;
};
