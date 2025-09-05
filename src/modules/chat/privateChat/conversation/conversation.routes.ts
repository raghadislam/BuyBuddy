import express from "express";

import {
  getOrCreatePrivateConversationZodSchema,
  getPrivateConversationZodSchema,
  archiveConversationZodSchema,
} from "./conversation.validation";
import {
  getOrCreatePrivateConversation,
  getPrivateConversation,
  getAllprivateConversations,
  archivePrivateConversation,
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

export default router;
