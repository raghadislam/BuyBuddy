import express from "express";

import privateRouter from "./privateChat/private.routes";

const router = express.Router();

router.use("/private", privateRouter);

export default router;
