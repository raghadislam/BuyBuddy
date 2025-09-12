import { Router } from "express";
import { validate } from "../../middlewares/validation.middleware";
import { searchByTextZodSchema } from "./search.validation";
import { searchProductsByText } from "./search.controller";

const router = Router();

router.post("/text", validate(searchByTextZodSchema), searchProductsByText);

export default router;
