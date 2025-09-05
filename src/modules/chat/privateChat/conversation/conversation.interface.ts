import { IPrivateConversationParticipant } from "../conversationParticipant/conversationParticipant.interface";
import { IPrivateMessage } from "../message/messge.interface";

export interface IPrivateConversation {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  archivedAt?: Date;
  participants: IPrivateConversationParticipant[];
  messages: IPrivateMessage[];
}

export interface IGetOrCreatePrivateConversationPayload {
  userId: string;
  recipientId: string;
}

export interface IGetPrivateConversationPayload {
  userId: string;
  conversationId: string;
}

export interface IGetAllPrivateConversationsPayload {
  userId: string;
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
  userId: string;
  conversationId: string;
}
