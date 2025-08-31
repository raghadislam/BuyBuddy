import { RequestHandler } from "express";

import { ISignupPayload, IVerfiyEmail, ILoginPayload } from "./auth.interface";
import AuthService from "./auth.service";
import { sendResponse, sendCookie } from "../../utils/response";

export const signup: RequestHandler = async (req, res) => {
  const payload: ISignupPayload = req.body;
  const user = await AuthService.signup(payload);

  sendResponse(res, {
    statusCode: 201,
    message: "Signup successful. Please verify your email.",
    data: {
      user,
    },
  });
};

export const verfyEmail: RequestHandler = async (req, res) => {
  const payload: IVerfiyEmail = req.body;
  const { user, accessToken, refreshToken } = await AuthService.verfyEmail(
    payload
  );

  sendCookie(res, refreshToken);
  sendResponse(res, {
    statusCode: 200,
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
    statusCode: 200,
    message: "Login successful.",
    data: {
      user,
    },
    accessToken,
  });
};
