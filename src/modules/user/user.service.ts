import prisma from "../../config/prisma.config";
import { IUpdateUserProfile } from "./user.interface";
import logger from "../../config/logger.config";
import { HttpStatus } from "../../enums/httpStatus.enum";
import APIError from "../../utils/APIError";
import { profileSelect } from "../auth/auth.select";

class UserService {
  async updateUserProfile(accountId: string, payload: IUpdateUserProfile) {
    const user = await prisma.user.update({
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

    if (!user) {
      throw new APIError(
        "Failed to update account",
        HttpStatus.InternalServerError
      );
    }

    logger.info("User profile updated for userID", user.id);
    return user;
  }
}

export default new UserService();
