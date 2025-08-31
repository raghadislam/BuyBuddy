import express from "express";

import { signup, verfyEmail, login } from "./auth.controller";
import { validate } from "../../middlewares/validation.middleware";
import {
  signupZodSchema,
  verifyEmailZodSchema,
  loginZodSchema,
} from "./auth.validation";

const router = express.Router();

router.post("/signup", validate(signupZodSchema), signup);

router.post("/verify-email", validate(verifyEmailZodSchema), verfyEmail);

router.post("/login", validate(loginZodSchema), login);

export default router;
