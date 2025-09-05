import { IPrivateMessage } from "../message/messge.interface";

export interface IPrivateMessageAttachment {
  id: string;
  message: IPrivateMessage;
  messageId: string;
  url: string;
  mimeType?: string;
  createdAt: Date;
  updatedAt: Date;
}
