import express from "express";

import {
  getPrivateMessagesZodSchema,
  reactToMessageZodSchema,
} from "./message.validation";
import { getMessages, reactToMessage } from "./message.controller";
import { validate } from "../../../../middlewares/validation.middleware";
import { authenticate } from "../../../../middlewares/authenticate.middleware";

const router = express.Router({ mergeParams: true });

router.get(
  "/",
  authenticate,
  validate(getPrivateMessagesZodSchema),
  getMessages
);

router.post(
  "/:messageId/react",
  authenticate,
  validate(reactToMessageZodSchema),
  reactToMessage
);

export default router;
