import jwt from "jsonwebtoken";

import env from "../../config/env.config";
import {
  IAccessTokenPayload,
  IRefreshTokenPayload,
} from "../../modules/auth/auth.interface";

const generateJWT = <T extends object>(
  data: T,
  secret: string,
  expiresIn: string
): string => {
  return jwt.sign(data, secret, {
    expiresIn: expiresIn,
  } as object);
};

export const generateAccessToken = (data: IAccessTokenPayload): string => {
  return generateJWT(
    data,
    env.ACCESS_TOKEN_SECRET,
    env.ACCESS_TOKEN_EXPIRES_IN
  );
};

export const generateRefreshToken = (data: IRefreshTokenPayload): string => {
  return generateJWT(
    data,
    env.REFRESH_TOKEN_SECRET,
    env.REFRESH_TOKEN_EXPIRES_IN
  );
};
