import { Account } from "../../../auth/auth.type";
import { PrivateMessage } from "../message/message.type";

export type PrivateMessageVisibility = {
  id: string;
  message: PrivateMessage;
  messageId: string;
  account: Account;
  accountId: string;
  readAt?: Date;
  deletedAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};
