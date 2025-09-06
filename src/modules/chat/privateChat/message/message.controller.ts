import { RequestHandler } from "express";

import { IGetPrivateMessages } from "./message.interface";
import privateMessageService from "./message.service";
import { sendResponse } from "../../../../utils/response";
import { HttpStatus } from "../../../../enums/httpStatus.enum";
import { ReactToPrivateMessage } from "./message.type";

export const getMessages: RequestHandler = async (req, res, next) => {
  const accountId = req.account?.id;
  const { conversationId } = req.params;
  const { cursor, since, limit } = req.query;

  const payload: IGetPrivateMessages = {
    accountId: accountId!,
    conversationId,
    cursor: cursor as string,
    limit: limit ? parseInt(limit as string, 10) : undefined,
    since: since ? new Date(since as string) : undefined,
  };

  const data = await privateMessageService.getMessages(payload);

  return sendResponse(res, {
    statusCode: HttpStatus.OK,
    message: "Messages fetched successfully.",
    data,
  });
};

export const reactToMessage: RequestHandler = async (req, res, next) => {
  const payload: ReactToPrivateMessage = {
    accountId: req.account?.id!,
    messageId: req.params.messageId,
    reactionType: req.body?.reactionType,
  };

  const message = await privateMessageService.reactToMessage(payload);

  return sendResponse(res, {
    statusCode: HttpStatus.OK,
    message: "Message Reaction updated successfully.",
    data: {
      message,
    },
  });
};
