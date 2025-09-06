import express from "express";

import conversationRouter from "./conversation/conversation.routes";
import messageRouter from "./message/message.routes";

const router = express.Router();

router.use("/conversations", conversationRouter);
router.use("/messages", messageRouter);

export default router;
