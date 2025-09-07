import { Response, CookieOptions } from "express";

import env from "../config/env.config";

export type APIStatus = "success" | "fail" | "error";

export interface SendResponseOptions<T = unknown> {
  statusCode?: number;
  status?: APIStatus;
  message?: string;
  accessToken?: string;
  data?: T;
}

export function sendResponse<T = unknown>(
  res: Response,
  {
    statusCode = 200,
    status = "success",
    message,
    accessToken,
    data,
  }: SendResponseOptions<T>
): Response {
  const body: Record<string, unknown> = { status };

  if (typeof accessToken !== "undefined") body.accessToken = accessToken;
  if (typeof message !== "undefined") body.message = message;
  if (typeof data !== "undefined") body.data = data;

  return res.status(statusCode).json(body);
}

export function sendCookie(res: Response, token: string): Response {
  const expires = new Date(
    Date.now() + env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
  );

  const cookieOptions: CookieOptions = {
    expires,
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };

  res.cookie("refreshToken", token, cookieOptions);
  return res;
}
