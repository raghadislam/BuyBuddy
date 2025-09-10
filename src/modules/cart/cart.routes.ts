import express from "express";

import { getCart } from "./cart.controller";
import { authenticate } from "../../middlewares/authenticate.middleware";
import restrictTo from "../../middlewares/restrictTo.middleware";
import { Role } from "@prisma/client";

const router = express.Router();

router.post("/me", authenticate, restrictTo(Role.USER), getCart);

export default router;
