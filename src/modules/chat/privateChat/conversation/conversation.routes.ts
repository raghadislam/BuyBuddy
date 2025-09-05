import express from "express";

import { getOrCreatePrivateConversationZodSchema } from "./conversation.validation";
import { getOrCreatePrivateConversation } from "./conversation.controller";
import { validate } from "../../../../middlewares/validation.middleware";
import { authenticate } from "../../../../middlewares/authenticate.middleware";

const router = express.Router();

router.post(
  "/:recipientId",
  authenticate,
  validate(getOrCreatePrivateConversationZodSchema),
  getOrCreatePrivateConversation
);

export default router;
