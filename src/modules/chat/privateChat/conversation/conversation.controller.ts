import { RequestHandler } from "express";

import { IGetOrCreatePrivateConversation } from "./conversation.interface";
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
