import express from "express";

import { getCart, addItem } from "./cart.controller";
import { authenticate } from "../../middlewares/authenticate.middleware";
import restrictTo from "../../middlewares/restrictTo.middleware";
import { Role } from "@prisma/client";
import { validate } from "../../middlewares/validation.middleware";
import { addItemZodSchema } from "./cart.validation";

const router = express.Router();

router.post("/me", authenticate, restrictTo(Role.USER), getCart);

router.post(
  "/items",
  authenticate,
  restrictTo(Role.USER),
  validate(addItemZodSchema),
  addItem
);

export default router;
