import { RequestHandler } from "express";

import { UpdateBrandProfile } from "./brand.type";
import brandService from "./brand.service";
import { sendResponse, sendCookie } from "../../utils/response";
import { HttpStatus } from "../../enums/httpStatus.enum";

export const updateBrandProfile: RequestHandler = async (req, res) => {
  const payload: UpdateBrandProfile = { ...req.body };

  if ((req as any).uploadedLogo) {
    payload.logo = (req as any).uploadedLogo.url;
    payload.photoPublicId = (req as any).uploadedLogo.public_id;
  }

  const brand = await brandService.updateBrandProfile(
    req.account?.id!,
    payload
  );

  return sendResponse(res, {
    statusCode: HttpStatus.OK,
    message: "Profile updated successfully.",
    data: { brand },
  });
};
