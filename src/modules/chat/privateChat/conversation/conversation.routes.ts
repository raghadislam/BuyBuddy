import express from "express";

import {
  getOrCreatePrivateConversationZodSchema,
  getPrivateConversationZodSchema,
  archiveConversationZodSchema,
  unarchiveConversationZodSchema,
} from "./conversation.validation";
import {
  getOrCreatePrivateConversation,
  getPrivateConversation,
  getAllprivateConversations,
  archivePrivateConversation,
  unarchivePrivateConversation,
} from "./conversation.controller";
import { validate } from "../../../../middlewares/validation.middleware";
import { authenticate } from "../../../../middlewares/authenticate.middleware";

const router = express.Router();

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

router.get("/", authenticate, getAllprivateConversations);

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

export default router;
