import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import { HttpStatus } from "../enums/httpStatus.enum";
import AppError from "../utils/APIError";

const multerStorage = multer.memoryStorage();

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  const { fieldname, mimetype } = file;

  const isImage = mimetype.startsWith("image");

  if (fieldname === "photo" || fieldname === "logo" || fieldname === "image") {
    return isImage
      ? cb(null, true)
      : cb(
          new AppError(
            "Only image files allowed for photo/logo/image.",
            HttpStatus.BadRequest
          ) as any,
          false
        );
  }

  return cb(
    new AppError(
      `Unexpected field '${fieldname}'`,
      HttpStatus.BadRequest
    ) as any,
    false
  );
};

const upload = multer({
  storage: multerStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).fields([
  { name: "photo", maxCount: 1 },
  { name: "logo", maxCount: 1 },
  { name: "image", maxCount: 1 },
]);

export default upload;
