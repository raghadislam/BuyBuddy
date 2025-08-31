// src/middlewares/notFound.middleware.ts
import { RequestHandler } from "express";
import logger from "../config/logger.config";

export const notFound: RequestHandler = (req, res, next) => {
  logger.warn(`Route ${req.originalUrl} not found`);
  res.status(404).json({
    status: "Error",
    message: `Route: ${req.originalUrl} not found`,
  });
};
