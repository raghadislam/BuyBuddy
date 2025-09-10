import express from "express";

import { updateUserProfileZodSchema } from "./user.validation";
import { updateUserProfile } from "./user.controller";
import { authenticate } from "../../middlewares/authenticate.middleware";
import { validate } from "../../middlewares/validation.middleware";
import upload from "../../middlewares/multer.middleware";
import { handlePhotoUpload } from "../../middlewares/uploadsHandler.middleware";

const router = express.Router();

router.patch(
  "/me/profile",
  authenticate,
  validate(updateUserProfileZodSchema),
  upload,
  handlePhotoUpload,
  updateUserProfile
);

export default router;
