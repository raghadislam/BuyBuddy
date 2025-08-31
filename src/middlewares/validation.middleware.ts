import { ZodObject } from "zod";
import { RequestHandler } from "express";
import { fromError } from "zod-validation-error";
import APIError from "../utils/APIError";

export const validate =
  (schema: ZodObject): RequestHandler =>
  (req, res, next) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err) {
      const error = fromError(err);
      next(new APIError(error.message, 400));
    }
  };
