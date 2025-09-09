import { Socket } from "socket.io";

import logger from "../config/logger.config";
import APIError from "../utils/APIError";
import { HttpStatus } from "../enums/httpStatus.enum";
import {
  verifyAccessToken,
  verifyRefreshToken,
} from "../modules/auth/token.service";
import prisma from "../config/prisma.config";
import { accountSafeSelect } from "../modules/auth/auth.select";
import { Status } from "@prisma/client";

type CustomSocket = Socket & { data: { accountId?: string } };

const parseCookies = (cookieHeader?: string): Record<string, string> => {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;
  cookieHeader.split(";").forEach((pair) => {
    const [k, ...v] = pair.split("=");
    if (!k) return;
    out[k.trim()] = decodeURIComponent((v || []).join("=").trim());
  });
  return out;
};

export async function socketAuth(
  socket: Socket,
  next: (err?: APIError | Error) => void
) {
  const accessToken = socket.handshake?.auth?.accessToken as string | undefined;

  if (!accessToken) {
    throw new APIError(
      "You are not logged in! please login to get access.",
      HttpStatus.Unauthorized
    );
  }

  try {
    const accessDecoded = verifyAccessToken(String(accessToken));
    if (!accessDecoded?.id) {
      return next(
        new APIError(
          "Invalid or expired access token.",
          HttpStatus.Unauthorized
        )
      );
    }

    // Fetch the account (safe projection)
    const account = await prisma.account.findUnique({
      where: { id: accessDecoded.id },
      select: accountSafeSelect,
    });

    if (!account) {
      return next(
        new APIError(
          "No account found for the provided token.",
          HttpStatus.Unauthorized
        )
      );
    }

    // Check account account status and return helpful, actionable messages
    if (account.status === Status.INACTIVE) {
      throw new APIError(
        "Account is inactive. Please contact support to reactivate your account.",
        403
      );
    }

    if (account.status === Status.SUSPENDED) {
      throw new APIError(
        "Account suspended. If you believe this is an error, please contact support.",
        403
      );
    }
    /**
     *
     * ************************************************************************
     * Until I figure out how to include the refreshToken in the socket headers
     * ************************************************************************
     *
     */

    // Extract refresh token from handshake cookies
    // const cookieHeader = socket.handshake.headers?.cookie as string | undefined;
    // const cookies = parseCookies(cookieHeader);
    // const refreshToken = cookies["refreshToken"];

    // // If there is no refresh token in the cookies, immediately reject the request
    // console.log(socket.handshake);
    // if (!refreshToken) {
    //   return next(
    //     new APIError(
    //       "Invalid or expired refresh token.",
    //       HttpStatus.Unauthorized
    //     )
    //   );
    // }

    // // Verify refresh token & check DB record
    // let refreshDecoded;
    // try {
    //   refreshDecoded = verifyRefreshToken(String(refreshToken));
    // } catch (e) {
    //   return next(
    //     new APIError(
    //       "Invalid or expired refresh token.",
    //       HttpStatus.Unauthorized
    //     )
    //   );
    // }
    // const refreshTokenRecord = await prisma.refreshToken.findFirst({
    //   where: {
    //     revokedReason: null,
    //     jti: refreshDecoded.jti,
    //   },
    // });

    // if (!refreshTokenRecord) {
    //   return next(
    //     new APIError(
    //       "Invalid or expired refresh token.",
    //       HttpStatus.Unauthorized
    //     )
    //   );
    // }

    (socket as CustomSocket).data.accountId = accessDecoded.id;
    return next();
  } catch (err) {
    logger.warn("Socket auth failed", err);
    return next(
      new APIError(
        "Authentication error: Invalid token",
        HttpStatus.Unauthorized
      )
    );
  }
}
