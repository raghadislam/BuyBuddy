import { ReactionType } from "../../../../generated/prisma";

export type ReactToPrivateMessage = {
  accountId: string;
  messageId: string;
  reactionType: ReactionType;
};
