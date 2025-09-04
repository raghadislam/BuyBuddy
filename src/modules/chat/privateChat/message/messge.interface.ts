import { IPrivateConversation } from "../conversation/conversation.interface";
import { IAccount } from "../../../auth/auth.interface";
import { IPrivateMessageAttachment } from "../messageAttachment/messageAttachment.interface";
import { ContentType, ReactionType } from "../../../../generated/prisma";
import { IPrivateMessageVisibility } from "../messageVisibility/messageVisibility.interface";
export interface IPrivateMessage {
  id: string;
  conversation: IPrivateConversation;
  conversationId: string;
  sender: IAccount;
  senderId: string;
  content?: string;
  contentType: ContentType;
  createdAt: Date;
  updatedAt: Date;
  readAt?: Date;
  deletedAt?: Date;
  attachments: IPrivateMessageAttachment[];
  reactionType?: ReactionType;
  reactedById?: string;
  reactedBy?: IAccount;
  visibilities: IPrivateMessageVisibility[];
}
