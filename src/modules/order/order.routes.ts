import { Router } from "express";
import { validate } from "../../middlewares/validation.middleware";
import { authenticate } from "../../middlewares/authenticate.middleware";
import {
  checkout,
  confirmPayment,
  cancelOrder,
  getAllOrders,
  getOrder,
  confirmRefund,
} from "./order.controller";
import {
  CheckoutZodSchema,
  PaymentConfirmZodSchema,
  RefundConfirmZodSchema,
} from "./order.validation";

const router = Router();

router.post("/checkout", authenticate, validate(CheckoutZodSchema), checkout);
router.post(
  "/payment/confirm",
  authenticate,
  validate(PaymentConfirmZodSchema),
  confirmPayment
);
router.post("/:orderId/cancel", authenticate, cancelOrder);
router.get("/:orderId", authenticate, getOrder);
router.get("/", authenticate, getAllOrders);

router.post(
  "/payment/refund",
  authenticate,
  validate(RefundConfirmZodSchema),
  confirmRefund
);

export default router;
