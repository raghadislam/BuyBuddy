import express from "express";
import { sendNotification } from "./notification.controller";
import { authenticate } from "../../middlewares/authenticate.middleware";
import { validate } from "../../middlewares/validation.middleware";
import { sendNotificationZodSchema } from "./notification.validation";

const router = express.Router();

router
  .route("/")
  .post(authenticate, validate(sendNotificationZodSchema), sendNotification);

export default router;
