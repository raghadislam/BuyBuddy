import { PrivateConversation } from "../conversation/conversation.type";
import { Account } from "../../../auth/auth.type";

export type PrivateConversationParticipant = {
  id: string;
  conversation: PrivateConversation;
  conversationId: string;
  account: Account;
  accountId: string;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
};
