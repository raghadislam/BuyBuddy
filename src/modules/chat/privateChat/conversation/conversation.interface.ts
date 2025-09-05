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

export interface IGetOrCreatePrivateConversation {
  userId: string;
  recipientId: string;
}
