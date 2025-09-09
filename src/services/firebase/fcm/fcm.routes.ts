import express from "express";
import {
  registerToken,
  unregisterToken,
  subscribeToTopic,
  unsubscribeFromTopic,
} from "./fcm.controller";
import { authenticate } from "../../../middlewares/authenticate.middleware";
import { validate } from "../../../middlewares/validation.middleware";
import {
  registerTokenZodSchema,
  unregisterTokenZodSchema,
  subscribeToTopicZodSchema,
  unsubscribeFromTopicZodSchema,
} from "./fcm.validation";

const router = express.Router();

router.post(
  "/register-token",
  authenticate,
  validate(registerTokenZodSchema),
  registerToken
);

router.post(
  "/unregister-token",
  authenticate,
  validate(unregisterTokenZodSchema),
  unregisterToken
);

router.post(
  "/subscribe-topic",
  authenticate,
  validate(subscribeToTopicZodSchema),
  subscribeToTopic
);

router.post(
  "/unsubscribe-topic",
  authenticate,
  validate(unsubscribeFromTopicZodSchema),
  unsubscribeFromTopic
);

export default router;
