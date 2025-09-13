import { Router } from "express";

import { validate } from "../../middlewares/validation.middleware";
import { searchByTextZodSchema } from "./search.validation";
import {
  searchProductsByText,
  searchProductsByImage,
} from "./search.controller";
import upload from "../../middlewares/multer.middleware";
import { handleImageUpload } from "../../middlewares/uploadsHandler.middleware";
const router = Router();

router.post("/text", validate(searchByTextZodSchema), searchProductsByText);

router.post("/image", upload, handleImageUpload, searchProductsByImage);

export default router;
