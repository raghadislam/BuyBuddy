import { RequestHandler } from "express";

import fcmService from "./fcm.service";
import { sendResponse } from "../../../utils/response";
import { HttpStatus } from "../../../enums/httpStatus.enum";
import {
  RegisterTokenPayload,
  UnregisterTokenPayload,
  UnsubscribeFromTopic,
  SubscribeToTopicPayload,
} from "./fcm.type";

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

export const subscribeToTopic: RequestHandler = async (req, res) => {
  const { tokens, topic } = req.body;

  const payload: SubscribeToTopicPayload = { tokens, topic };
  const result = await fcmService.subscribeToTopic(payload);

  return sendResponse(res, {
    statusCode: HttpStatus.OK,
    message: "Subscribed to topic successfully.",
    data: result,
  });
};

export const unsubscribeFromTopic: RequestHandler = async (req, res) => {
  const { tokens, topic } = req.body;

  const payload: UnsubscribeFromTopic = { tokens, topic };
  const result = await fcmService.unsubscribeFromTopic(payload);

  return sendResponse(res, {
    statusCode: HttpStatus.OK,
    message: "Unsubscribed from topic successfully.",
    data: result,
  });
};
