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

router.post(
  "/orders/checkout",
  authenticate,
  validate(CheckoutInput),
  checkout
);
router.post(
  "/orders/payment/confirm",
  authenticate,
  validate(PaymentConfirmInput),
  confirmPayment
); // webhook-ish
router.post("/orders/:orderId/cancel", authenticate, cancelOrder);
router.get("/orders/:orderId", authenticate, getOrder);
router.get("/orders", authenticate, getAllOrders);

export default router;
