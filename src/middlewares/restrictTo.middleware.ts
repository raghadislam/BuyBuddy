import { RequestHandler } from "express";
import APIError from "../utils/APIError";
import { Role } from "@prisma/client";
import { HttpStatus } from "../enums/httpStatus.enum";

export default (...roles: Role[]): RequestHandler => {
  return (req, res, next) => {
    if (roles.length > 0 && !roles.includes(req.account?.role as Role)) {
      throw new APIError(
        "You are not authorized to access that",
        HttpStatus.Forbidden
      );
    }

    next();
  };
};
