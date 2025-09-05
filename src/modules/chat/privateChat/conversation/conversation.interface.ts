import { IPrivateConversationParticipant } from "../conversationParticipant/conversationParticipant.interface";
import { IPrivateMessage } from "../message/message.interface";

export interface IPrivateConversation {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  archivedAt?: Date;
  participants: IPrivateConversationParticipant[];
  messages: IPrivateMessage[];
}

export interface IGetOrCreatePrivateConversationPayload {
  accountId: string;
  recipientId: string;
}

export interface IGetPrivateConversationPayload {
  accountId: string;
  conversationId: string;
}

export interface IGetAllPrivateConversationsPayload {
  accountId: string;
}

export interface IAnyPrivateConversation {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  archivedAt?: Date;
  participants?: IPrivateConversationParticipant[];
  messages?: IPrivateMessage[];
}

export interface IArchivePrivateConversation {
  accountId: string;
  conversationId: string;
}

export interface IUnarchivePrivateConversation
  extends IArchivePrivateConversation {}
