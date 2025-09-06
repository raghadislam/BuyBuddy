import prisma from "../../config/prisma.config";
import { IUpdateUserProfile } from "./user.interface";
import logger from "../../config/logger.config";
import { HttpStatus } from "../../enums/httpStatus.enum";
import APIError from "../../utils/APIError";
import { profileSelect } from "../auth/auth.select";

class UserService {
  async updateUserProfile(accountId: string, payload: IUpdateUserProfile) {
    const {
      government,
      city,
      primaryAddress,
      secondaryAddress,
      landmark,
      paymentMethods,
      ...userFields
    } = payload;

    const user = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: {
          accountId,
        },
        data: {
          ...userFields,
          ...(paymentMethods !== undefined && {
            paymentMethods: { set: paymentMethods },
          }),
        },
        include: {
          addresses: true,
        },
      });

      if (!user) {
        throw new APIError(
          "Failed to update account",
          HttpStatus.InternalServerError
        );
      }

      const upsertAddress = async (
        isPrimary: boolean,
        line?: string | null
      ) => {
        if (!line && !city && !government && !landmark) return;

        const existing = user.addresses.find((a) => a.isPrimary === isPrimary);
        if (existing) {
          await tx.address.update({
            where: {
              id: existing.id,
            },
            data: {
              addressLine: line ?? existing.addressLine,
              city: city ?? existing.city,
              government: government ?? existing.government,
              landmark: landmark ?? existing.landmark,
              isPrimary,
            },
          });
        } else {
          await tx.address.create({
            data: {
              userId: user.id,
              addressLine: line ?? "",
              government: government ?? null,
              city: city ?? null,
              landmark: landmark ?? null,
              isPrimary,
            },
          });
        }
      };

      // primary address (isPrimary = true)
      await upsertAddress(true, primaryAddress ?? null);

      // secondary address (isPrimary = false)
      await upsertAddress(false, secondaryAddress ?? null);

      // return updated user with included relations
      const updated = await tx.user.findUnique({
        where: { id: user.id },
        include: {
          account: { select: profileSelect },
          addresses: true,
        },
      });

      if (!updated) {
        throw new APIError(
          "Failed to fetch updated user",
          HttpStatus.InternalServerError
        );
      }

      return updated;
    });

    logger.info("User profile updated for userID", user.id);
    return user;
  }
}

export default new UserService();
