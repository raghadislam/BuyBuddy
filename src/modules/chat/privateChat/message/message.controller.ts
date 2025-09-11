import { RequestHandler } from "express";

import privateMessageService from "./message.service";
import { sendResponse } from "../../../../utils/response";
import { HttpStatus } from "../../../../enums/httpStatus.enum";
import {
  ReactToPrivateMessage,
  SendPrivateMessagePayload,
  MarkMessageReadPayload,
  DeleteForMePayload,
  DeleteForAllPayload,
  SearchMessagesPayload,
  GetPrivateMessages,
  MarkAllMessagesDeliveredPayload,
} from "./message.type";

export const getMessages: RequestHandler = async (req, res, next) => {
  const accountId = req.account?.id;
  const { conversationId } = req.params;
  const { cursor, since, limit } = req.query;

  const payload: GetPrivateMessages = {
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

export const sendMessage: RequestHandler = async (req, res, next) => {
  const payload: SendPrivateMessagePayload = {
    accountId: req.account?.id!,
    conversationId: req.params.conversationId,
    content: req.body.content,
    contentType: req.body.contentType,
    attachments: req.body.attachments ?? [],
  };

  const message = await privateMessageService.sendMessage(payload);
  return sendResponse(res, {
    statusCode: HttpStatus.OK,
    message: "Message created successfully.",
    data: {
      message,
    },
  });
};

export const markMessageRead: RequestHandler = async (req, res, next) => {
  const payload: MarkMessageReadPayload = {
    accountId: req.account?.id!,
    conversationId: req.params.conversationId,
    messageId: req.params.messageId,
  };

  const data = await privateMessageService.markMessageRead(payload);
  sendResponse(res, {
    statusCode: HttpStatus.OK,
    message: "Message marked as read successfully.",
    data,
  });
};

export const deleteMessageForMe: RequestHandler = async (req, res, next) => {
  const payload: DeleteForMePayload = {
    accountId: req.account?.id!,
    conversationId: req.params.conversationId,
    messageId: req.params.messageId,
  };

  const data = await privateMessageService.deleteMessageForMe(payload);
  sendResponse(res, {
    statusCode: HttpStatus.OK,
    message: "Message deleted for your view only.",
    data,
  });
};

export const deleteMessageForAll: RequestHandler = async (req, res, next) => {
  const payload: DeleteForAllPayload = {
    accountId: req.account?.id!,
    conversationId: req.params.conversationId,
    messageId: req.params.messageId,
  };

  const data = await privateMessageService.deleteMessageForAll(payload);
  sendResponse(res, {
    statusCode: HttpStatus.OK,
    message: "Message deleted for everyone.",
    data,
  });
};

export const searchMessages: RequestHandler = async (req, res, next) => {
  const payload: SearchMessagesPayload = {
    accountId: req.account?.id!,
    conversationId: req.params.conversationId,
    query: req.body.query,
    match: req.body.match,
    caseSensitive: req.body.caseSensitive,
    limit: req.query.limit ? Number(req.query.limit) : 50,
    cursor: req.query.cursor ? String(req.query.cursor) : undefined,
  };

  const messages = await privateMessageService.searchMessagesByString(payload);
  return sendResponse(res, {
    statusCode: HttpStatus.OK,
    message: "Messages fetched successfully.",
    data: {
      messages,
    },
  });
};

export const markAllMessagesDelivered: RequestHandler = async (
  req,
  res,
  next
) => {
  const payload: MarkAllMessagesDeliveredPayload = {
    accountId: req.account?.id!,
  };

  const data = await privateMessageService.markAllMessagesDelivered(payload);
  return sendResponse(res, {
    statusCode: HttpStatus.OK,
    message: "All messages marked as delivered.",
    data,
  });
};
