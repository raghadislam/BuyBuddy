import jwt, { JwtPayload } from "jsonwebtoken";
import crypto from "crypto";

import env from "../../config/env.config";
import {
  IAccessTokenPayload,
  IRefreshTokenPayload,
} from "../../modules/auth/auth.interface";
import prisma from "../../config/prisma.config";

const generateJWT = <T extends object>(
  payload: T,
  secret: string,
  expiresIn: string
): string => {
  return jwt.sign(payload, secret, {
    expiresIn: expiresIn,
  } as object);
};

export const generateAccessToken = (payload: IAccessTokenPayload): string => {
  return generateJWT(
    payload,
    env.ACCESS_TOKEN_SECRET,
    env.ACCESS_TOKEN_EXPIRES_IN
  );
};

export const generateRefreshToken = async (
  payload: IRefreshTokenPayload
): Promise<string> => {
  const refreshToken = generateJWT(
    payload,
    env.REFRESH_TOKEN_SECRET,
    env.REFRESH_TOKEN_EXPIRES_IN
  );

  const hashed = hashToken(refreshToken);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + env.REFRESH_TOKEN_TTL_DAYS);

  await prisma.refreshToken.create({
    data: {
      jti: payload.jti,
      token: hashed,
      expiresAt,
      userId: payload.id,
    },
  });

  return refreshToken;
};

const verifyJWT = <T>(token: string, secret: string): T & JwtPayload => {
  return jwt.verify(token, secret) as T & JwtPayload;
};

export const verifyAccessToken = (token: string) => {
  return verifyJWT<IAccessTokenPayload>(token, env.ACCESS_TOKEN_SECRET);
};

export const verifyRefreshToken = (token: string) => {
  return verifyJWT<IRefreshTokenPayload>(token, env.REFRESH_TOKEN_SECRET);
};

export const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
