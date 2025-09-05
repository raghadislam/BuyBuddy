import { IPrivateConversation } from "../conversation/conversation.interface";
import { IAccount } from "../../../auth/auth.interface";

export interface IPrivateConversationParticipant {
  id: string;
  conversation: IPrivateConversation;
  conversationId: string;
  account: IAccount;
  accountId: string;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}
