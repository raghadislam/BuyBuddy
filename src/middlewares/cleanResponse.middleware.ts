import { Request, Response, NextFunction } from "express";
import { removeNulls } from "../utils/removeNulls.utills";
import logger from "../config/logger.config";

export function cleanResponseMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);

    res.json = (body?: any) => {
      try {
        // Skip cleaning for buffers, streams and when body is explicitly falsy but not an object/array
        // (e.g. res.json(null) will fall through and be replaced with {})
        if (body instanceof Buffer) return originalJson(body);
        // Detect streams: a very simple heuristic (can't catch all stream types)
        // If an object has a `pipe` function, assume it's a stream and skip cleaning
        if (
          body &&
          typeof body === "object" &&
          typeof (body as any).pipe === "function"
        )
          return originalJson(body);

        const cleaned = removeNulls(body);
        // If the entire body was `null`/`undefined`, send an empty object to avoid sending nothing
        return originalJson(cleaned === undefined ? {} : cleaned);
      } catch (err) {
        logger.error("cleanResponseMiddleware error:", err);
        return originalJson(body);
      }
    };

    next();
  };
}
