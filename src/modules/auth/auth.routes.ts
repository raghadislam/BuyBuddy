import express from "express";

import {
  signup,
  verifyEmail,
  login,
  refresh,
  logout,
  forgetPassword,
  verifyResetCode,
  resetPassword,
  googleCallbackHandler,
  resendVerification,
} from "./auth.controller";
import { validate } from "../../middlewares/validation.middleware";
import { authenticate } from "../../middlewares/authenticate.middleware";
import {
  signupZodSchema,
  verifyEmailZodSchema,
  loginZodSchema,
  forgetPasswordZodSchema,
  resetPasswordZodSchema,
  verifyResetCodeZodSchema,
  resendVerificationZodSchema,
} from "./auth.validation";
import passport from "../../config/passport.config";

const router = express.Router();

router.post("/signup", validate(signupZodSchema), signup);

router.post(
  "/resend-verification",
  validate(resendVerificationZodSchema),
  resendVerification
);

router.post("/verify-email", validate(verifyEmailZodSchema), verifyEmail);

router.post("/login", validate(loginZodSchema), login);

router.post("/refresh", refresh);

router.post("/logout", authenticate, logout);

router.post(
  "/forget-password",
  validate(forgetPasswordZodSchema),
  forgetPassword
);

router.post(
  "/verify-reset-code",
  validate(verifyResetCodeZodSchema),
  verifyResetCode
);

router.post("/reset-password", validate(resetPasswordZodSchema), resetPassword);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  googleCallbackHandler
);
export default router;
