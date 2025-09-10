import sharp from "sharp";
import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.config";
import { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";
import { HttpStatus } from "../enums/httpStatus.enum";
import APIError from "./APIError";
import logger from "../config/logger.config";

// Define types for Cloudinary response
interface CloudinaryUploadResult extends UploadApiResponse {
  public_id: string;
  url: string;
  secure_url: string;
  format: string;
  created_at: string;
  [key: string]: any;
}

interface CloudinaryUploadOptions {
  folder?: string;
  public_id?: string;
  resource_type?: "image";
  transformation?: any[];
  [key: string]: any;
}

class Uploader {
  static async resizeImage(
    buffer: Buffer,
    width: number = 500,
    height: number = 500
  ): Promise<Buffer> {
    return sharp(buffer)
      .resize(width, height)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toBuffer();
  }

  static async uploadBufferToCloudinary(
    buffer: Buffer,
    options: CloudinaryUploadOptions = {}
  ): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        options,
        (
          err: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined
        ) => {
          if (err) {
            return reject(
              new APIError(
                err.message || "Cloudinary upload failed",
                HttpStatus.ServiceUnavailable
              )
            );
          }
          if (!result) {
            return reject(
              new APIError(
                "Cloudinary upload returned no result",
                HttpStatus.ServiceUnavailable
              )
            );
          }
          resolve(result as CloudinaryUploadResult);
        }
      );

      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
  }

  static async deleteCloudinaryFile(
    publicId: string,
    resourceType: "image" = "image"
  ): Promise<void> {
    if (!publicId) return;
    try {
      await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });
    } catch (err) {
      logger.error(`[Uploader] Delete failed for ${publicId}`, err);
    }
  }
}

export default Uploader;
