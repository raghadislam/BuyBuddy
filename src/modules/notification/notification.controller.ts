import { RequestHandler } from "express";
import notificationService from "./notification.service";
import { sendResponse } from "../../utils/response";
import { HttpStatus } from "../../enums/httpStatus.enum";
import {
  SendNotificationPayload,
  GetNotificationsPayload,
  MarkNotificationReadPayload,
} from "./notification.type";

export const sendNotification: RequestHandler = async (req, res) => {
  const actorId = req.account?.id!;
  const payload: SendNotificationPayload = {
    type: req.body.type,
    title: req.body.title,
    body: req.body.body,
    data: req.body.data,
    recipientIds: req.body.recipientIds,
    actorId,
  };

  const result = await notificationService.sendNotification(payload);

  return sendResponse(res, {
    statusCode: HttpStatus.OK,
    message: "Notification created successfully.",
    data: result,
  });
};

export const getNotifications: RequestHandler = async (req, res) => {
  const accountId = req.account?.id!;
  const { cursor, since, limit } = req.query;

  const payload: GetNotificationsPayload = {
    accountId,
    cursor: cursor as string,
    limit: limit ? parseInt(limit as string, 10) : undefined,
    since: since ? new Date(since as string) : undefined,
  };

  const data = await notificationService.getNotifications(payload);

  return sendResponse(res, {
    statusCode: HttpStatus.OK,
    message: "Notifications fetched successfully.",
    data,
  });
};

export const markNotificationRead: RequestHandler = async (req, res) => {
  const payload: MarkNotificationReadPayload = {
    accountId: req.account?.id!,
    notificationId: req.params.notificationId,
  };

  const result = await notificationService.markNotificationRead(payload);
  return sendResponse(res, {
    statusCode: HttpStatus.OK,
    message: "Notification marked read successfully.",
    data: result,
  });
};
