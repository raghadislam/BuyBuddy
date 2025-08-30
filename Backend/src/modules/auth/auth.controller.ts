import { RequestHandler } from "express";

import { ISignupPayload, IVerfiyEmail } from "./auth.interface";
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
