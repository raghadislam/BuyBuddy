import express from "express";
import { sendNotification, getNotifications } from "./notification.controller";
import { authenticate } from "../../middlewares/authenticate.middleware";
import { validate } from "../../middlewares/validation.middleware";
import {
  sendNotificationZodSchema,
  getNotificationsZodSchema,
} from "./notification.validation";

const router = express.Router();

router
  .route("/")
  .post(authenticate, validate(sendNotificationZodSchema), sendNotification)
  .get(authenticate, validate(getNotificationsZodSchema), getNotifications);

export default router;
