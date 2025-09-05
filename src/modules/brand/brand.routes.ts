import express from "express";

import { updateBrandProfileZodSchema } from "./brand.validation";
import { updateBrandProfile } from "./brand.controller";
import { authenticate } from "../../middlewares/authenticate.middleware";
import { validate } from "../../middlewares/validation.middleware";

const router = express.Router();

router.patch(
  "/me/profile",
  authenticate,
  validate(updateBrandProfileZodSchema),
  updateBrandProfile
);

export default router;
