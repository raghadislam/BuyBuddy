import express from "express";
import {
  sendNotification,
  getNotifications,
  markNotificationRead,
  deleteNotificationForMe,
  searchNotifications,
} from "./notification.controller";
import { authenticate } from "../../middlewares/authenticate.middleware";
import { validate } from "../../middlewares/validation.middleware";
import {
  sendNotificationZodSchema,
  getNotificationsZodSchema,
  markReadZodSchema,
  deleteForMeZodSchema,
  searchNotificationsZodSchema,
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

router.post(
  "/:notificationId/delete-for-me",
  authenticate,
  validate(deleteForMeZodSchema),
  deleteNotificationForMe
);

router.get(
  "/search",
  authenticate,
  validate(searchNotificationsZodSchema),
  searchNotifications
);

export default router;
