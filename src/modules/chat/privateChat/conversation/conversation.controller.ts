import { RequestHandler } from "express";

import {
  IGetOrCreatePrivateConversation,
  IGetPrivateConversation,
} from "./conversation.interface";
import privateConverstionService from "./conversation.service";
import { sendResponse } from "../../../../utils/response";
import { HttpStatus } from "../../../../enums/httpStatus.enum";

export const getOrCreatePrivateConversation: RequestHandler = async (
  req,
  res
) => {
  const payload: IGetOrCreatePrivateConversation = {
    recipientId: req.params.recipientId,
    userId: req.account?.id!,
  };
  const conversation = await privateConverstionService.getOrCreateConversation(
    payload
  );

  sendResponse(res, {
    statusCode: HttpStatus.Created,
    message: "Private conversation created successfully.",
    data: {
      conversation,
    },
  });
};

export const getPrivateConversation: RequestHandler = async (req, res) => {
  const payload: IGetPrivateConversation = {
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
