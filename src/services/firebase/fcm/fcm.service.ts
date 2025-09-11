import pLimit from "p-limit";

import prisma from "../../../config/prisma.config";
import {
  RegisterTokenPayload,
  UnregisterTokenPayload,
  SubscribeToTopicPayload,
  UnsubscribeFromTopic,
  SendToTopicPayload,
  SendToTokensPayload,
  SendToAccountPayload,
} from "./fcm.type";
import { HttpStatus } from "../../../enums/httpStatus.enum";
import APIError from "../../../utils/APIError";
import fcm from "../firbase.setup";
import messageService from "../../../modules/chat/privateChat/message/message.service";

class FcmService {
  private async sendToTokens(payload: SendToTokensPayload) {
    const { tokens, title, body } = payload;
    const limit = pLimit(10);

    const results = await Promise.all(
      tokens.map((token) =>
        limit(async () => {
          try {
            await fcm.send({
              token,
              notification: { title, body },
            });
            return { success: 1, failure: 0 };
          } catch (error) {
            return { success: 0, failure: 1 };
          }
        })
      )
    );

    // sum results
    return results.reduce(
      (acc, cur) => ({
        success: acc.success + cur.success,
        failure: acc.failure + cur.failure,
      }),
      { success: 0, failure: 0 }
    );
  }

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

  async sendToAccount(payload: SendToAccountPayload) {
    const { accountId, title, body } = payload;

    return await prisma.$transaction(async (tx) => {
      const tokens = await tx.deviceToken.findMany({
        where: {
          accountId,
          isActive: true,
        },
        select: { token: true },
      });

      if (tokens.length === 0) {
        throw new APIError(
          "No active tokens found for account",
          HttpStatus.NotFound
        );
      }

      const sendPayload: SendToTokensPayload = {
        title,
        body,
        tokens: tokens.map((t) => t.token),
      };
      const result = await this.sendToTokens(sendPayload);
      await messageService.markAllMessagesDelivered({ accountId });
      return result;
    });
  }

  async sendToTopic(payload: SendToTopicPayload) {
    const { topic, title, body } = payload;

    try {
      const result = await fcm.send({
        topic,
        notification: { title, body },
      });
      return { success: true, result };
    } catch (error) {
      return { success: false, error };
    }
  }
}

export default new FcmService();
