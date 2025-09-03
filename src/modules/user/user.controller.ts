import { RequestHandler } from "express";

import { IUpdateUserProfile } from "./user.interface";
import userService from "./user.service";
import { sendResponse, sendCookie } from "../../utils/response";
import { HttpStatus } from "../../enums/httpStatus.enum";

export const updateUserProfile: RequestHandler = async (req, res) => {
  const payload: IUpdateUserProfile = req.body;
  const user = await userService.updateUserProfile(req.account?.id!, payload);

  return sendResponse(res, {
    statusCode: HttpStatus.OK,
    message: "Profile updated successfully.",
    data: { user },
  });
};
