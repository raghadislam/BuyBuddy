import { RequestHandler } from "express";

import { UpdateUserProfile } from "./user.type";
import userService from "./user.service";
import { sendResponse, sendCookie } from "../../utils/response";
import { HttpStatus } from "../../enums/httpStatus.enum";

export const updateUserProfile: RequestHandler = async (req, res) => {
  const payload: UpdateUserProfile = { ...req.body };

  if ((req as any).uploadedPhoto) {
    payload.photo = (req as any).uploadedPhoto.url;
    payload.photoPublicId = (req as any).uploadedPhoto.public_id;
  }

  const user = await userService.updateUserProfile(req.account?.id!, payload);

  return sendResponse(res, {
    statusCode: HttpStatus.OK,
    message: "Profile updated successfully.",
    data: { user },
  });
};
