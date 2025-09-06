import express from "express";

import {
  getPrivateMessagesZodSchema,
  reactToMessageZodSchema,
  sendPrivateMessageZodSchema,
  markMessageReadZodSchema,
} from "./message.validation";
import {
  getMessages,
  markMessageRead,
  reactToMessage,
  sendMessage,
} from "./message.controller";
import { validate } from "../../../../middlewares/validation.middleware";
import { authenticate } from "../../../../middlewares/authenticate.middleware";

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(authenticate, validate(getPrivateMessagesZodSchema), getMessages)
  .post(authenticate, validate(sendPrivateMessageZodSchema), sendMessage);

router.post(
  "/:messageId/react",
  authenticate,
  validate(reactToMessageZodSchema),
  reactToMessage
);

router.post(
  "/:messageId/mark-read",
  authenticate,
  validate(markMessageReadZodSchema),
  markMessageRead
);

export default router;
