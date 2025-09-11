import { Router } from "express";
import { validate } from "../../middlewares/validation.middleware";
import { authenticate } from "../../middlewares/authenticate.middleware";
import {
  checkout,
  confirmPayment,
  cancelOrder,
  getAllOrders,
  getOrder,
} from "./order.controller";
import { CheckoutInput, PaymentConfirmInput } from "./order.validation";

const router = Router();

// TODO: add assertOrderOwnership middleware

router.post("/checkout", authenticate, validate(CheckoutInput), checkout);
router.post(
  "/payment/confirm",
  authenticate,
  validate(PaymentConfirmInput),
  confirmPayment
); // webhook-ish
router.post("/:orderId/cancel", authenticate, cancelOrder);
router.get("/:orderId", authenticate, getOrder);
router.get("/", authenticate, getAllOrders);

export default router;
