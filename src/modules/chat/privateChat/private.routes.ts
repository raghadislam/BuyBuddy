import express from "express";

import conversationRouter from "./conversation/conversation.routes";

const router = express.Router();

router.use("/conversations", conversationRouter);

export default router;
