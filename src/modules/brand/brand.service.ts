import prisma from "../../config/prisma.config";
import { UpdateBrandProfile } from "./brand.type";
import logger from "../../config/logger.config";
import { HttpStatus } from "../../enums/httpStatus.enum";
import APIError from "../../utils/APIError";
import { profileSelect } from "../auth/auth.select";

class BrandService {
  async updateBrandProfile(accountId: string, payload: UpdateBrandProfile) {
    const brand = await prisma.brand.update({
      where: {
        accountId,
      },
      data: payload,
      include: {
        account: {
          select: profileSelect,
        },
      },
    });

    if (!brand) {
      throw new APIError(
        "Failed to update profile",
        HttpStatus.InternalServerError
      );
    }

    logger.info("Brand profile updated for brandId", brand.id);
    return brand;
  }
}

export default new BrandService();
