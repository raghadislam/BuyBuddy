import { RequestHandler } from "express";

import {
  ISignupPayload,
  IVerfiyEmail,
  ILoginPayload,
  IForgetPasswordPayload,
  IResetPasswordPayload,
  IHandleGoogleCallbackPayload,
  IVerifyPasswordResetCode,
  ResendVerificationCode,
} from "./auth.interface";
import authService from "./auth.service";
import { sendResponse, sendCookie } from "../../utils/response";
import { HttpStatus } from "../../enums/httpStatus.enum";

export const signup: RequestHandler = async (req, res) => {
  const payload: ISignupPayload = req.body;
  const account = await authService.signup(payload);

  sendResponse(res, {
    statusCode: HttpStatus.Created,
    message: "Signup successful. Please verify your email.",
    data: {
      account,
    },
  });
};

export const resendVerification: RequestHandler = async (req, res, next) => {
  const payload: ResendVerificationCode = { email: req.body.email };
  const account = await authService.resendVerificationCode(payload);

  sendResponse(res, {
    statusCode: HttpStatus.Created,
    message: "Verification code resent successfully",
    data: {
      account,
    },
  });
};

export const verifyEmail: RequestHandler = async (req, res) => {
  const payload: IVerfiyEmail = req.body;
  const { account, accessToken, refreshToken } = await authService.verifyEmail(
    payload
  );

  sendCookie(res, refreshToken);
  sendResponse(res, {
    statusCode: HttpStatus.OK,
    message: "Email verified successfully.",
    data: {
      account,
    },
    accessToken,
  });
};

export const login: RequestHandler = async (req, res) => {
  const payload: ILoginPayload = req.body;
  const { account, accessToken, refreshToken } = await authService.login(
    payload
  );

  sendCookie(res, refreshToken);
  sendResponse(res, {
    statusCode: HttpStatus.OK,
    message: "Login successful.",
    data: {
      account,
    },
    accessToken,
  });
};

export const refresh: RequestHandler = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  const { account, accessToken, newRefreshToken } = await authService.refresh({
    refreshToken,
  });

  sendCookie(res, newRefreshToken);
  sendResponse(res, {
    statusCode: HttpStatus.OK,
    message: "Token refreshed successfully.",
    data: {
      account,
    },
    accessToken,
  });
};

export const logout: RequestHandler = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  await authService.logout({ refreshToken });

  res.clearCookie("refreshToken");
  sendResponse(res, {
    statusCode: HttpStatus.OK,
    message: "Logout successful.",
  });
};

export const forgetPassword: RequestHandler = async (req, res) => {
  const payload: IForgetPasswordPayload = req.body;
  await authService.forgetPassword(payload);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    message: "Password reset code has been sent.",
  });
};

export const verifyResetCode: RequestHandler = async (req, res, next) => {
  const payload: IVerifyPasswordResetCode = req.body;
  const result = await authService.verifyPasswordResetCode(payload);

  return sendResponse(res, {
    statusCode: HttpStatus.OK,
    message: "Code verified successfully",
    data: result,
  });
};

export const resetPassword: RequestHandler = async (req, res) => {
  const payload: IResetPasswordPayload = req.body;
  const { accessToken, refreshToken } = await authService.resetPassword(
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
  const { accessToken, refreshToken, account } =
    await authService.handleGoogleCallback(
      req.account as IHandleGoogleCallbackPayload
    );

  sendCookie(res, refreshToken);
  sendResponse(res, {
    statusCode: HttpStatus.OK,
    data: {
      account: req.account,
    },
    accessToken,
  });
};
