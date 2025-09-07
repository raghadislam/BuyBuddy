import { PrivateMessage } from "../message/message.type";

export type PrivateMessageAttachment = {
  id: string;
  message: PrivateMessage;
  messageId: string;
  url: string;
  mimeType?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type SendMessageAttachment = {
  url: string;
  mimeType: string;
};
