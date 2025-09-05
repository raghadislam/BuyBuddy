import { RequestHandler } from "express";

import {
  IGetOrCreatePrivateConversationPayload,
  IGetPrivateConversationPayload,
  IGetAllPrivateConversationsPayload,
  IArchivePrivateConversation,
} from "./conversation.interface";
import privateConverstionService from "./conversation.service";
import { sendResponse } from "../../../../utils/response";
import { HttpStatus } from "../../../../enums/httpStatus.enum";

export const getOrCreatePrivateConversation: RequestHandler = async (
  req,
  res
) => {
  const payload: IGetOrCreatePrivateConversationPayload = {
    recipientId: req.params.recipientId,
    userId: req.account?.id!,
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
  const payload: IGetPrivateConversationPayload = {
    conversationId: req.params.conversationId,
    userId: req.account?.id!,
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
  const payload: IGetAllPrivateConversationsPayload = {
    userId: req.account?.id!,
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
  const payload: IArchivePrivateConversation = {
    userId: req.account?.id!,
    conversationId: req.params.conversationId,
  };
  const data = await privateConverstionService.archiveConversation(payload);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    message: "Private conversations archieved successfully.",
    data,
  });
};
