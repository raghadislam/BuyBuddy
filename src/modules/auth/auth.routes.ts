import express from "express";

import {
  signup,
  verfyEmail,
  login,
  refresh,
  logout,
  forgetPassword,
  resetPassword,
} from "./auth.controller";
import { validate } from "../../middlewares/validation.middleware";
import {
  signupZodSchema,
  verifyEmailZodSchema,
  loginZodSchema,
  forgetPasswordZodSchema,
  resetPasswordZodSchema,
} from "./auth.validation";

const router = express.Router();

router.post("/signup", validate(signupZodSchema), signup);

router.post("/verify-email", validate(verifyEmailZodSchema), verfyEmail);

router.post("/login", validate(loginZodSchema), login);

router.post("/refresh", refresh);

router.post("/logout", logout);

router.post(
  "/forget-password",
  validate(forgetPasswordZodSchema),
  forgetPassword
);

router.post("/reset-password", validate(resetPasswordZodSchema), resetPassword);

export default router;
