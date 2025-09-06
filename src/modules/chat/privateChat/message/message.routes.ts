import express from "express";

import {
  getPrivateMessagesZodSchema,
  reactToMessageZodSchema,
  sendPrivateMessageZodSchema,
  markMessageReadZodSchema,
  deleteForMeZodSchema,
} from "./message.validation";
import {
  deleteMessageForMe,
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

router.post(
  "/:messageId/delete-for-me",
  authenticate,
  validate(deleteForMeZodSchema),
  deleteMessageForMe
);
export default router;
