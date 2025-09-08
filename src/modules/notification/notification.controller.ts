import { RequestHandler } from "express";
import notificationService from "./notification.service";
import { sendResponse } from "../../utils/response";
import { HttpStatus } from "../../enums/httpStatus.enum";
import { SendNotificationPayload } from "./notification.type";

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
