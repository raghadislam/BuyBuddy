import { Request, Response, NextFunction } from "express";
import AppError from "../utils/APIError";
import Uploader from "../utils/cloudinary";
import Logger from "../config/logger.config";

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  [key: string]: any;
}

export const handlePhotoUpload = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Use type assertions for custom properties
  const files = (req as any).files as
    | { photo?: Express.Multer.File[] }
    | undefined;

  let user;
  if ((req as any).account.user)
    user = (req as any).account.user as
      | { id: string; photoPublicId?: string }
      | undefined;
  else
    user = (req as any).account.brand as
      | { id: string; photoPublicId?: string }
      | undefined;

  if (!files?.photo?.[0]) return next();

  const file = files.photo[0];
  const filename = `user-${user!.id}-${Date.now()}`;

  try {
    const resizedBuffer = await Uploader.resizeImage(file.buffer);

    if (user?.photoPublicId) {
      await Uploader.deleteCloudinaryFile(user.photoPublicId);
    }

    const result = (await Uploader.uploadBufferToCloudinary(resizedBuffer, {
      folder: "users",
      public_id: filename,
      resource_type: "image",
    })) as CloudinaryUploadResult;

    (req as any).uploadedPhoto = {
      url: result.secure_url,
      public_id: result.public_id,
    };

    next();
  } catch (err) {
    Logger.error(err);
    next(new AppError("Failed to upload photo to Cloudinary", 500));
  }
};
