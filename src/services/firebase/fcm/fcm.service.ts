import prisma from "../../../config/prisma.config";
import {
  RegisterTokenPayload,
  UnregisterTokenPayload,
  SubscribeToTopicPayload,
  UnsubscribeFromTopic,
} from "./fcm.type";
import { HttpStatus } from "../../../enums/httpStatus.enum";
import APIError from "../../../utils/APIError";
import fcm from "../firbase.setup";

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

  async unregisterToken(payload: UnregisterTokenPayload) {
    const { token, accountId } = payload;

    const tokenRecord = await prisma.deviceToken.findUnique({
      where: { token },
      select: { accountId: true },
    });

    if (!tokenRecord || tokenRecord.accountId !== accountId) {
      throw new APIError(
        "Token does not belong to the user",
        HttpStatus.Forbidden
      );
    }

    await prisma.deviceToken.updateMany({
      where: { token },
      data: { isActive: false },
    });
  }

  async subscribeToTopic(payload: SubscribeToTopicPayload) {
    const { tokens, topic } = payload;

    const validTokens = await prisma.deviceToken.findMany({
      where: {
        token: { in: tokens },
      },
      select: { token: true },
    });

    if (validTokens.length !== tokens.length) {
      throw new APIError(
        "Some tokens are not active or not found",
        HttpStatus.BadRequest
      );
    }

    return fcm.subscribeToTopic(
      validTokens.map((t) => t.token),
      topic
    );
  }

  async unsubscribeFromTopic(payload: UnsubscribeFromTopic) {
    const { tokens, topic } = payload;

    const validTokens = await prisma.deviceToken.findMany({
      where: {
        token: { in: tokens },
      },
      select: { token: true },
    });

    if (validTokens.length !== tokens.length) {
      throw new APIError(
        "Some tokens are not active or not found",
        HttpStatus.BadRequest
      );
    }

    return fcm.unsubscribeFromTopic(
      validTokens.map((t) => t.token),
      topic
    );
  }
}

export default new FcmService();
