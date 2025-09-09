import { RequestHandler } from "express";

import fcmService from "./fcm.service";
import { sendResponse } from "../../../utils/response";
import { HttpStatus } from "../../../enums/httpStatus.enum";
import { RegisterTokenPayload, UnregisterTokenPayload } from "./fcm.type";

export const registerToken: RequestHandler = async (req, res) => {
  const accountId = req.account?.id!;
  const { token } = req.body;

  const payload: RegisterTokenPayload = {
    accountId,
    token,
  };
  const result = await fcmService.registerToken(payload);

  return sendResponse(res, {
    statusCode: HttpStatus.OK,
    message: "FCM token registered successfully.",
    data: result,
  });
};

export const unregisterToken: RequestHandler = async (req, res) => {
  const accountId = req.account?.id!;
  const { token } = req.body;

  const payload: UnregisterTokenPayload = { token, accountId };
  await fcmService.unregisterToken(payload);

  return sendResponse(res, {
    statusCode: HttpStatus.OK,
    message: "FCM token unregistered successfully.",
  });
};
