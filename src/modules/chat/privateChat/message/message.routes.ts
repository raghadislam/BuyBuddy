import express from "express";

import {
  getPrivateMessagesZodSchema,
  reactToMessageZodSchema,
  sendPrivateMessageZodSchema,
} from "./message.validation";
import { getMessages, reactToMessage, sendMessage } from "./message.controller";
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

export default router;
