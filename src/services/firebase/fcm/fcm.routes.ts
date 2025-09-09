import express from "express";
import { registerToken, unregisterToken } from "./fcm.controller";
import { authenticate } from "../../../middlewares/authenticate.middleware";
import { validate } from "../../../middlewares/validation.middleware";
import {
  registerTokenZodSchema,
  unregisterTokenZodSchema,
} from "./fcm.validation";

const router = express.Router();

router.post(
  "/register-token",
  authenticate,
  validate(registerTokenZodSchema),
  registerToken
);

router.post(
  "/unregister-token",
  authenticate,
  validate(unregisterTokenZodSchema),
  unregisterToken
);

export default router;
