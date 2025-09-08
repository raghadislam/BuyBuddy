import { RequestHandler } from "express";

import {
  GetOrCreatePrivateConversationPayload,
  GetPrivateConversationPayload,
  GetAllPrivateConversationsPayload,
  ArchivePrivateConversation,
  UnarchivePrivateConversation,
  MarkReadPayload,
} from "./conversation.type";
import privateConverstionService from "./conversation.service";
import { sendResponse } from "../../../../utils/response";
import { HttpStatus } from "../../../../enums/httpStatus.enum";

export const getOrCreatePrivateConversation: RequestHandler = async (
  req,
  res
) => {
  const payload: GetOrCreatePrivateConversationPayload = {
    recipientId: req.params.recipientId,
    accountId: req.account?.id!,
  };
  const { conversation, isNew } =
    await privateConverstionService.getOrCreateConversation(payload);

  sendResponse(res, {
    statusCode: isNew ? HttpStatus.Created : HttpStatus.OK,
    message: isNew
      ? "Private conversation created successfully."
      : "Private conversation retrieved successfully.",
    data: {
      conversation,
    },
  });
};

export const getPrivateConversation: RequestHandler = async (req, res) => {
  const payload: GetPrivateConversationPayload = {
    conversationId: req.params.conversationId,
    accountId: req.account?.id!,
  };
  const conversation = await privateConverstionService.getConversation(payload);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    message: "Private conversation retrieved successfully.",
    data: {
      conversation,
    },
  });
};

export const getAllprivateConversations: RequestHandler = async (req, res) => {
  const payload: GetAllPrivateConversationsPayload = {
    accountId: req.account?.id!,
  };
  const conversations = await privateConverstionService.getAllConversations(
    payload
  );

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    message: "Private conversations retrieved successfully.",
    data: {
      conversations,
    },
  });
};

export const archivePrivateConversation: RequestHandler = async (req, res) => {
  const payload: ArchivePrivateConversation = {
    accountId: req.account?.id!,
    conversationId: req.params.conversationId,
  };
  const data = await privateConverstionService.archiveConversation(payload);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    message: "Private conversations archieved successfully.",
    data,
  });
};

export const unarchivePrivateConversation: RequestHandler = async (
  req,
  res
) => {
  const payload: UnarchivePrivateConversation = {
    accountId: req.account?.id!,
    conversationId: req.params.conversationId,
  };
  const data = await privateConverstionService.unarchiveConversation(payload);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    message: "Private conversation unarchived successfully.",
    data,
  });
};

export const markRead: RequestHandler = async (req, res, next) => {
  const accountId = (req as any).user?.id ?? (res.locals as any).accountId;
  const payload: MarkReadPayload = {
    accountId: req.account?.id!,
    conversationId: req.params.conversationId,
    upToMessageId: req.query.upToMessageId as string | undefined,
  };

  const data = await privateConverstionService.markRead(payload);
  sendResponse(res, {
    statusCode: HttpStatus.OK,
    message: "Private conversation messages marked as read successfully.",
    data,
  });
};
