import express from "express";

import { getPrivateMessagesZodSchema } from "./message.validation";
import { getMessages } from "./message.controller";
import { validate } from "../../../../middlewares/validation.middleware";
import { authenticate } from "../../../../middlewares/authenticate.middleware";

const router = express.Router({ mergeParams: true });

router.get(
  "/",
  authenticate,
  validate(getPrivateMessagesZodSchema),
  getMessages
);

export default router;
