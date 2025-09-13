import express from "express";

import {
  getOrCreatePrivateConversationZodSchema,
  getPrivateConversationZodSchema,
  archiveConversationZodSchema,
  unarchiveConversationZodSchema,
  markReadZodSchema,
} from "./conversation.validation";
import {
  getOrCreatePrivateConversation,
  getPrivateConversation,
  getAllprivateConversations,
  archivePrivateConversation,
  unarchivePrivateConversation,
  markRead,
  getArchivedPrivateConversations,
} from "./conversation.controller";
import { validate } from "../../../../middlewares/validation.middleware";
import { authenticate } from "../../../../middlewares/authenticate.middleware";
import messageRouter from "../message/message.routes";

const router = express.Router();

router.use("/:conversationId/messages", messageRouter);

router.get("/", authenticate, getAllprivateConversations);
router.get("/archived", authenticate, getArchivedPrivateConversations);

router.patch(
  "/:conversationId/archive",
  authenticate,
  validate(archiveConversationZodSchema),
  archivePrivateConversation
);

router.patch(
  "/:conversationId/unarchive",
  authenticate,
  validate(unarchiveConversationZodSchema),
  unarchivePrivateConversation
);

router.post(
  "/:conversationId/mark-read",
  authenticate,
  validate(markReadZodSchema),
  markRead
);

router.post(
  "/:recipientId",
  authenticate,
  validate(getOrCreatePrivateConversationZodSchema),
  getOrCreatePrivateConversation
);

router.get(
  "/:conversationId",
  authenticate,
  validate(getPrivateConversationZodSchema),
  getPrivateConversation
);

export default router;
