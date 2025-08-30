import express from "express";

import { signup, verfyEmail } from "./auth.controller";
import { validate } from "../../middlewares/validation.middleware";
import { signupZodSchema, verifyEmailZodSchema } from "./auth.validation";

const router = express.Router();

router.post("/signup", validate(signupZodSchema), signup);

router.get("/verify-email", validate(verifyEmailZodSchema), verfyEmail);

export default router;
