import crypto from "crypto";

import { ISignupPayload, IVerfiyEmail } from "./auth.interface";
import prisma from "../../config/prisma.config";
import APIError from "../../utils/APIError";
import { Status } from "../../enums/status.enum";
import {
  sendVerificationCode,
  sendAccountVerifiedEmail,
} from "../../services/email/send";
import { hashPassword } from "../../utils/functions/hash";
import logger from "../../config/logger.config";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../services/auth/token.service";
class AuthService {
  async signup(payload: ISignupPayload) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (existingUser) {
      // Reactivate account if inactive
      if (existingUser.status === Status.INACTIVE) {
        sendVerificationCode(existingUser.email, {
          subject: "Activate your account",
        });
        return existingUser;
      }

      // Resend verification code if unverified
      if (existingUser.status === Status.UNVERIFIED) {
        sendVerificationCode(existingUser.email, {
          subject: "Verify your email",
        });
        return existingUser;
      }

      // Handle suspended accounts
      if (existingUser.status === Status.SUSPENDED) {
        throw new APIError(
          "Your account has been suspended. Please contact support.",
          403
        );
      }

      // User is active
      throw new APIError("User already exists", 409);
    }

    // Hash password and create new user
    payload.password = await hashPassword(payload.password);
    const user = await prisma.user.create({
      data: {
        email: payload.email,
        password: payload.password,
        firstName: payload.firstName,
        lastName: payload.lastName,
        status: Status.UNVERIFIED,
        role: payload.role,
      },
    });

    if (!user) {
      throw new APIError("Failed to create user", 500);
    }

    // Send verification code
    sendVerificationCode(user.email, { subject: "Verify your email" });

    logger.info(
      `New user registered ID: ${user.id}, name: ${user.firstName} ${user.lastName}`
    );
    return user;
  }

  async verfyEmail(payload: IVerfiyEmail) {
    const hashedCode = crypto
      .createHash("sha256")
      .update(payload.code)
      .digest("hex");
    const existingUser = await prisma.user.findFirst({
      where: {
        verificationCode: hashedCode,
        verificationCodeExpiresAt: { gt: new Date() },
      },
    });

    if (!existingUser) {
      throw new APIError("Invalid or expired code", 404);
    }

    const user = await prisma.user.update({
      where: { email: existingUser.email },
      data: {
        status: Status.ACTIVE,
        verificationCode: null,
        verificationCodeExpiresAt: null,
      },
    });

    if (!user) {
      throw new APIError("Failed to verify email", 500);
    }

    const accessToken = generateAccessToken({
      id: user.id,
      role: user.role,
      createdAt: user.createdAt,
      status: user.status,
      email: user.email,
    });
    const refreshToken = generateRefreshToken({ id: user.id });

    sendAccountVerifiedEmail(user.email, {
      subject: "Verify your email",
      firstName: user.firstName,
    });

    logger.info(
      `User verified ID: ${user.id}, name: ${user.firstName} ${user.lastName}`
    );
    return { user, accessToken, refreshToken };
  }
}

export default new AuthService();
