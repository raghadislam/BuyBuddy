import express from "express";

import {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  preflightCheckout,
} from "./cart.controller";
import { authenticate } from "../../middlewares/authenticate.middleware";
import restrictTo from "../../middlewares/restrictTo.middleware";
import { Role } from "@prisma/client";
import { validate } from "../../middlewares/validation.middleware";
import {
  addItemZodSchema,
  updateItemZodSchema,
  removeItemZodSchema,
} from "./cart.validation";

const router = express.Router();

router.get("/", authenticate, restrictTo(Role.USER), getCart);

router.post(
  "/items/:variantId",
  authenticate,
  restrictTo(Role.USER),
  validate(addItemZodSchema),
  addItem
);

router.patch(
  "/items/:variantId",
  authenticate,
  restrictTo(Role.USER),
  validate(updateItemZodSchema),
  updateItem
);

router.delete(
  "/items/:variantId",
  authenticate,
  restrictTo(Role.USER),
  validate(removeItemZodSchema),
  removeItem
);

router.delete("/", authenticate, restrictTo(Role.USER), clearCart);

router.post(
  "/checkout/preview",
  authenticate,
  restrictTo(Role.USER),
  preflightCheckout
);
export default router;
