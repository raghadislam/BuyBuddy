import express from "express";
import { registerToken } from "./fcm.controller";
import { authenticate } from "../../../middlewares/authenticate.middleware";
import { validate } from "../../../middlewares/validation.middleware";
import { registerTokenZodSchema } from "./fcm.validation";

const router = express.Router();

router.post(
  "/register-token",
  authenticate,
  validate(registerTokenZodSchema),
  registerToken
);

export default router;
