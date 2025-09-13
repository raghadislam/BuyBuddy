import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import { rateLimit } from "express-rate-limit";

import authRouter from "./modules/auth/auth.routes";
import userRouter from "./modules/user/user.routes";
import brandRouter from "./modules/brand/brand.routes";
import chatRouter from "./modules/chat/chat.routes";
import productRouter from "./modules/product/product.routes";
import notificationRouter from "./modules/notification/notification.routes";
import cartRouter from "./modules/cart/cart.routes";
import fcmRouter from "./services/firebase/fcm/fcm.routes";
import orderRouter from "./modules/order/order.routes";
import shipmentRouter from "./modules/shipment/shipment.routes";
import searchRouter from "./modules/search/search.route";
import { notFound } from "./middlewares/notFound.middleware";
import { errorHandler } from "./middlewares/error.middleware";
import { cleanResponseMiddleware } from "./middlewares/cleanResponse.middleware";
import setupSockets from "./services/socket/socket.setup";
import env from "./config/env.config";
import arena from "./jobs/arena";
import "./jobs";

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 400,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: "You reached your limit, Please try again later.",
  validate: { xForwardedForHeader: false },
});

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

// CORS configuration
// app.use(
//   cors({
//     origin: env.NODE_ENV === "production" ? env.ALLOWED_ORIGINS : "*",
//     credentials: true,
//   })
// );

app.use(
  cors({
    origin(origin, cb) {
      if (!origin || env.ALLOWED_ORIGINS.includes(origin))
        return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rate Limiting
app.use(limiter);

app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());

app.use(cleanResponseMiddleware());

// Health check endpoint
app.use("/health", (req, res) => {
  res.status(200).send("OK");
});

// API Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/brands", brandRouter);
app.use("/api/v1/chats", chatRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/fcm", fcmRouter);
app.use("/api/v1/carts", cartRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/shipments", shipmentRouter);
app.use("/api/v1/search", searchRouter);

// 404 catcher — should come after routes
app.use(notFound);

// Global error handler — LAST middleware
app.use(errorHandler);

export default server;
