import express from "express";
import bodyParser from "body-parser";
const cookieParser = require("cookie-parser");

import authRouter from "./modules/auth/auth.routes";
import userRouter from "./modules/user/user.routes";
import brandRouter from "./modules/brand/brand.routes";
import chatRouter from "./modules/chat/chat.routes";
import productRouter from "./modules/product/product.routes";
import { notFound } from "./middlewares/notFound.middleware";
import { errorHandler } from "./middlewares/error.middleware";
import { cleanResponseMiddleware } from "./middlewares/cleanResponse.middleware";

const app = express();

app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());

app.use(cleanResponseMiddleware());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/brands", brandRouter);
app.use("/api/v1/chats", chatRouter);
app.use("/api/v1/products", productRouter);

// 404 catcher — should come after routes
app.use(notFound);

// Global error handler — LAST middleware
app.use(errorHandler);

export default app;
