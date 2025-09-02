import { RequestHandler } from "express";

import {
  ISignupPayload,
  IVerfiyEmail,
  ILoginPayload,
  IForgetPasswordPayload,
  IResetPasswordPayload,
  IHandleGoogleCallbackPayload,
} from "./auth.interface";
import AuthService from "./auth.service";
import { sendResponse, sendCookie } from "../../utils/response";
import { HttpStatus } from "../../enums/httpStatus.enum";

export const signup: RequestHandler = async (req, res) => {
  const payload: ISignupPayload = req.body;
  const user = await AuthService.signup(payload);

  sendResponse(res, {
    statusCode: HttpStatus.Created,
    message: "Signup successful. Please verify your email.",
    data: {
      user,
    },
  });
};

export const verifyEmail: RequestHandler = async (req, res) => {
  const payload: IVerfiyEmail = req.body;
  const { user, accessToken, refreshToken } = await AuthService.verifyEmail(
    payload
  );

  sendCookie(res, refreshToken);
  sendResponse(res, {
    statusCode: HttpStatus.OK,
    message: "Email verified successfully.",
    data: {
      user,
    },
    accessToken,
  });
};

export const login: RequestHandler = async (req, res) => {
  const payload: ILoginPayload = req.body;
  const { user, accessToken, refreshToken } = await AuthService.login(payload);

  sendCookie(res, refreshToken);
  sendResponse(res, {
    statusCode: HttpStatus.OK,
    message: "Login successful.",
    data: {
      user,
    },
    accessToken,
  });
};

export const refresh: RequestHandler = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  const { user, accessToken, newRefreshToken } = await AuthService.refresh({
    refreshToken,
  });

  sendCookie(res, newRefreshToken);
  sendResponse(res, {
    statusCode: HttpStatus.OK,
    message: "Token refreshed successfully.",
    data: {
      user,
    },
    accessToken,
  });
};

export const logout: RequestHandler = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  await AuthService.logout({ refreshToken });

  res.clearCookie("refreshToken");
  sendResponse(res, {
    statusCode: HttpStatus.OK,
    message: "Logout successful.",
  });
};

export const forgetPassword: RequestHandler = async (req, res) => {
  const payload: IForgetPasswordPayload = req.body;
  await AuthService.forgetPassword(payload);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    message: "Password reset code has been sent.",
  });
};

export const resetPassword: RequestHandler = async (req, res) => {
  const payload: IResetPasswordPayload = req.body;
  const { accessToken, refreshToken } = await AuthService.resetPassword(
    payload
  );

  sendCookie(res, refreshToken);
  sendResponse(res, {
    statusCode: HttpStatus.OK,
    message:
      "Your password has been reset successfully. You are now signed in on this device. For security reasons, all other sessions have been logged out.",
    accessToken,
  });
};

export const googleCallbackHandler: RequestHandler = async (req, res, next) => {
  const { accessToken, refreshToken, user } =
    await AuthService.handleGoogleCallback(
      req.user as IHandleGoogleCallbackPayload
    );

  sendCookie(res, refreshToken);
  sendResponse(res, {
    statusCode: HttpStatus.OK,
    data: {
      user: req.user,
    },
    accessToken,
  });
};
