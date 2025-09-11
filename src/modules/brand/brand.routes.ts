import express from "express";

import { updateBrandProfileZodSchema } from "./brand.validation";
import { updateBrandProfile } from "./brand.controller";
import { authenticate } from "../../middlewares/authenticate.middleware";
import { validate } from "../../middlewares/validation.middleware";
import upload from "../../middlewares/multer.middleware";
import { handleLogoUpload } from "../../middlewares/uploadsHandler.middleware";

const router = express.Router();

router.patch(
  "/me/profile",
  authenticate,
  validate(updateBrandProfileZodSchema),
  upload,
  handleLogoUpload,
  updateBrandProfile
);

export default router;
