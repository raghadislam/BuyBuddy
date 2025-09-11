import { Router } from "express";
import { validate } from "../../middlewares/validation.middleware";
import { authenticate } from "../../middlewares/authenticate.middleware";
import { updateShipmentStatus } from "./shipment.controller";
import { updateShipmentStatusSchema } from "./shipment.validation";

const router = Router();

router.post(
  "/updateStatus",
  authenticate,
  validate(updateShipmentStatusSchema),
  updateShipmentStatus
);

export default router;
