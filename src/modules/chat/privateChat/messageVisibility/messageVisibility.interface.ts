import { IAccount } from "../../../auth/auth.interface";
import { IPrivateMessage } from "../message/message.interface";

export interface IPrivateMessageVisibility {
  id: string;
  message: IPrivateMessage;
  messageId: string;
  account: IAccount;
  accountId: string;
  readAt?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
