import { RequestHandler, Request } from "express";

import APIError from "../utils/APIError";
import {
  verifyAccessToken,
  verifyRefreshToken,
} from "../modules/auth/token.service";
import prisma from "../config/prisma.config";
import { Status } from "../enums/status.enum";
import { userSafeSelect } from "../modules/user/user.select";

const getTokenFromRequest = (req: Request): string | undefined => {
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer ")
  )
    throw new APIError(
      "You are not logged in! please login to get access.",
      401
    );
  return req.headers.authorization.split(" ")[1];
};

export const authenticate: RequestHandler = async (req: Request, res, next) => {
  // Read token from reques
  const accessToken = getTokenFromRequest(req);
  if (!accessToken || accessToken === "null")
    throw new APIError(
      "You are not logged in! please login to get access.",
      401
    );

  // Verify access token and extract payload.
  const accessDecoded = verifyAccessToken(accessToken);
  if (!accessDecoded?.id) {
    throw new APIError("Invalid or expired access token.", 401);
  }

  // Fetch the user referenced in the token. We select a "safe" projection
  const user = await prisma.user.findUnique({
    where: { id: accessDecoded.id },
    select: userSafeSelect,
  });

  if (!user) {
    throw new APIError("No user found for the provided token.", 401);
  }

  const { refreshToken } = req.cookies;

  // If there is no refresh token in the cookies, immediately reject the request
  if (!refreshToken) {
    throw new APIError("Invalid or expired refresh token.", 401);
  }

  // Verify refresh token and extract payload.
  const refreshDecoded = verifyRefreshToken(refreshToken);

  // Look up a matching refresh token record in the database that are not revoked
  const refreshTokenRecord = await prisma.refreshToken.findFirst({
    where: {
      revokedReason: null,
      jti: refreshDecoded.jti,
    },
  });

  // If no record is found, the token is either revoked
  if (!refreshTokenRecord) {
    throw new APIError("Invalid or expired refresh token.", 401);
  }

  // Check user account status and return helpful, actionable messages
  if (user.status === Status.INACTIVE) {
    throw new APIError(
      "Account is inactive. Please contact support to reactivate your account.",
      403
    );
  }

  if (user.status === Status.SUSPENDED) {
    throw new APIError(
      "Account suspended. If you believe this is an error, please contact support.",
      403
    );
  }

  if (user.status === Status.UNVERIFIED) {
    throw new APIError(
      "Email not verified. Please verify your email address before continuing.",
      403
    );
  }

  // Attach the safe user object to the request so downstream handlers can use it
  req.user = user;
  next();
};
