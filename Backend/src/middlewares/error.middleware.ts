import { ErrorRequestHandler } from "express";

import config from "../config/env.config";
import logger from "../config/logger.config";
import APIError from "../utils/APIError";

const handlePrismaValidationError = (error: any): APIError => {
  const msg = (error.message || "").replace(
    /Argument `where` of type .* needs at least one of `(.*?)`/,
    "Missing required field: $1."
  );
  return new APIError(msg, 400);
};

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // Convert known Prisma error shapes to APIError
  if (err?.name === "PrismaClientValidationError") {
    err = handlePrismaValidationError(err);
  }

  if (err?.name === "TokenExpiredError") {
    err = new APIError("Invalid or expired token, please login again.", 403);
  }

  // If it's not an APIError, wrap it so shape is consistent
  if (!(err instanceof APIError)) {
    const statusCode = err?.statusCode || 500;
    const message = err?.message || "Internal server error";
    err = new APIError(message, statusCode);
  }

  logger.error(err.message, { route: req.originalUrl, stack: err.stack });

  const payload: any = {
    status:
      err.status || (err.statusCode && err.statusCode >= 400 ? "Error" : "OK"),
    message: err.message,
  };

  if (config.NODE_ENV !== "production") {
    payload.stack = err.stack;
    payload.raw = err;
  }

  res.status(err.statusCode || 500).json(payload);
};
