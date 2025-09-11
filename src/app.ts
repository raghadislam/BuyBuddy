import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";

import authRouter from "./modules/auth/auth.routes";
import userRouter from "./modules/user/user.routes";
import brandRouter from "./modules/brand/brand.routes";
import chatRouter from "./modules/chat/chat.routes";
import productRouter from "./modules/product/product.routes";
import notificationRouter from "./modules/notification/notification.routes";
import cartRouter from "./modules/cart/cart.routes";
import fcmRouter from "./services/firebase/fcm/fcm.routes";
import { notFound } from "./middlewares/notFound.middleware";
import { errorHandler } from "./middlewares/error.middleware";
import { cleanResponseMiddleware } from "./middlewares/cleanResponse.middleware";
import setupSockets from "./services/socket/socket.setup";
import env from "./config/env.config";
import arena from "./jobs/arena";

const app = express();
const server = createServer(app);

// socket setup
const io = new Server(server, {
  cors: {
    origin: env.BASE_URL,
    credentials: true,
  },
});
setupSockets(io);

app.use("/", arena);

app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());

app.use(cleanResponseMiddleware());

app.use("/health", (req, res) => {
  res.status(200).send("OK");
});
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/brands", brandRouter);
app.use("/api/v1/chats", chatRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/fcm", fcmRouter);
app.use("/api/v1/carts", cartRouter);

// 404 catcher — should come after routes
app.use(notFound);

// Global error handler — LAST middleware
app.use(errorHandler);

export default server;
