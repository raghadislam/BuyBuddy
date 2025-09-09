import prisma from "../../../config/prisma.config";
import { RegisterTokenPayload } from "./fcm.type";

class FcmService {
  async registerToken(payload: RegisterTokenPayload) {
    const { accountId, token } = payload;
    const now = new Date();
    const result = await prisma.deviceToken.upsert({
      where: { token },
      update: {
        accountId,
        isActive: true,
        lastSeenAt: now,
      },
      create: {
        token,
        accountId,
        isActive: true,
        lastSeenAt: now,
        createdAt: now,
      },
    });

    return result;
  }
}

export default new FcmService();
