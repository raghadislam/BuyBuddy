import express from "express";

import {
  getPrivateMessagesZodSchema,
  reactToMessageZodSchema,
  sendPrivateMessageZodSchema,
  markMessageReadZodSchema,
  deleteForMeZodSchema,
  deleteForAllZodSchema,
  searchMessagesZodSchema,
} from "./message.validation";
import {
  deleteMessageForAll,
  deleteMessageForMe,
  getMessages,
  markAllMessagesDelivered,
  markMessageRead,
  reactToMessage,
  searchMessages,
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

router.post(
  "/:messageId/delete-for-all",
  authenticate,
  validate(deleteForAllZodSchema),
  deleteMessageForAll
);

router.get(
  "/search",
  authenticate,
  validate(searchMessagesZodSchema),
  searchMessages
);

router.post("/mark-delivered", authenticate, markAllMessagesDelivered);

export default router;
