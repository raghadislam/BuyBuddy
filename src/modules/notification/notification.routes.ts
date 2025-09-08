import express from "express";
import {
  sendNotification,
  getNotifications,
  markNotificationRead,
} from "./notification.controller";
import { authenticate } from "../../middlewares/authenticate.middleware";
import { validate } from "../../middlewares/validation.middleware";
import {
  sendNotificationZodSchema,
  getNotificationsZodSchema,
  markReadZodSchema,
} from "./notification.validation";

const router = express.Router();

router
  .route("/")
  .post(authenticate, validate(sendNotificationZodSchema), sendNotification)
  .get(authenticate, validate(getNotificationsZodSchema), getNotifications);

router.post(
  "/:notificationId/mark-read",
  authenticate,
  validate(markReadZodSchema),
  markNotificationRead
);

export default router;
