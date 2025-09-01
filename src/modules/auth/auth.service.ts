import crypto from "crypto";

import {
  ISignupPayload,
  IVerfiyEmail,
  ILoginPayload,
  IRefreshPayload,
  ILogoutPayload,
} from "./auth.interface";
import prisma from "../../config/prisma.config";
import APIError from "../../utils/APIError";
import { Status } from "../../enums/status.enum";
import { RevokedReason } from "../../generated/prisma";
import {
  sendVerificationCode,
  sendAccountVerifiedEmail,
} from "../../services/email/send";
import { hashPassword, comparePassword } from "../../utils/functions/hash";
import logger from "../../config/logger.config";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
} from "./token.service";
import { userSafeSelect, userLoginSelect } from "../user/user.select";

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
      select: userSafeSelect,
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
    // Hash the provided verification code so it can be compared with the hashed code stored in the database.
    const hashedCode = crypto
      .createHash("sha256")
      .update(payload.code)
      .digest("hex");

    // Find a user that has this verification code and whose code hasn't expired.
    // This ensures the code is both valid and still within the TTL.
    const existingUser = await prisma.user.findFirst({
      where: {
        verificationCode: hashedCode,
        verificationCodeExpiresAt: { gt: new Date() },
      },
    });

    // If no matching user is found, the code is invalid or expired.
    if (!existingUser) {
      throw new APIError("Invalid or expired code", 404);
    }

    // Update the user's status to ACTIVE and clear the verification fields.
    const user = await prisma.user.update({
      where: { email: existingUser.email },
      data: {
        status: Status.ACTIVE,
        verificationCode: null,
        verificationCodeExpiresAt: null,
      },
      select: userSafeSelect,
    });

    // If the update failed for some reason, throw an error.
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
    const refreshToken = await generateRefreshToken({ id: user.id });

    // Notify the user that their account has been verified.
    sendAccountVerifiedEmail(user.email, {
      subject: "Verify your email",
      firstName: user.firstName,
    });

    logger.info(
      `User verified ID: ${user.id}, name: ${user.firstName} ${user.lastName}`
    );
    return { user, accessToken, refreshToken };
  }

  async login(payload: ILoginPayload) {
    const { email, password } = payload;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      select: userLoginSelect,
    });

    // If no user found or password does not match, throw error
    if (!user || !(await comparePassword(password, user.password))) {
      throw new APIError("Invalid email or password", 401);
    }

    // If user has not verified their email, resend verification code and block login
    if (user.status === Status.UNVERIFIED) {
      sendVerificationCode(user.email, { subject: "Verify your email" });
      throw new APIError("Please verify your email to continue", 403);
    }

    // If user is inactive, resend activation code and block login
    if (user.status === Status.INACTIVE) {
      sendVerificationCode(user.email, { subject: "Activate your account" });
      throw new APIError(
        "Your account is inactive. Please check your email to activate your account.",
        403
      );
    }

    // If user is suspended, block login
    if (user.status === Status.SUSPENDED) {
      throw new APIError(
        "Your account has been suspended. Please contact support.",
        403
      );
    }

    const accessToken = generateAccessToken({
      id: user.id,
      role: user.role,
      createdAt: user.createdAt,
      status: user.status,
      email: user.email,
    });
    const refreshToken = await generateRefreshToken({ id: user.id });

    // Exclude the password field from the user object and keep the rest as safeUser
    const { password: _, ...safeUser } = user;

    logger.info(
      `User logged in ID: ${user.id}, name: ${user.firstName} ${user.lastName}`
    );
    return { user: safeUser, accessToken, refreshToken };
  }

  async refresh(payload: IRefreshPayload) {
    const { refreshToken } = payload;
    const decoded = await verifyRefreshToken(refreshToken);

    if (!decoded) {
      throw new APIError("Invalid refresh token", 401);
    }

    // Find user by ID
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: userSafeSelect,
    });

    // Ensure the user exists before proceeding with token refresh
    if (!user) {
      throw new APIError("User not found", 403);
    }

    // Check if user exists and is not suspended before refreshing token
    if (user.status === Status.SUSPENDED) {
      throw new APIError(
        "Your account has been suspended. Please contact support.",
        403
      );
    }

    // check if user is inactive
    if (user.status === Status.INACTIVE) {
      throw new APIError("User is not active", 403);
    }

    // Check if user is unverified
    if (user.status === Status.UNVERIFIED) {
      sendVerificationCode(user.email, { subject: "Verify your email" });
      throw new APIError("Please verify your email to continue", 403);
    }

    const accessToken = generateAccessToken({
      id: user.id,
      role: user.role,
      createdAt: user.createdAt,
      status: user.status,
      email: user.email,
    });

    logger.info(
      `Token refreshed for user ID: ${user.id}, name: ${user.firstName} ${user.lastName}`
    );
    return { user, accessToken };
  }

  async logout(payload: ILogoutPayload) {
    const { refreshToken } = payload;
    // Hash the refresh token for secure comparison in the database
    const hashed = hashToken(refreshToken);

    // Revoke the refresh token by updating its record in the database
    await prisma.refreshToken.updateMany({
      where: { token: hashed, revokedAt: null },
      data: { revokedAt: new Date(), revokedReason: RevokedReason.USER_LOGOUT },
    });

    logger.info(`Refresh token revoked for logout: ${hashed}`);
    return;
  }
}

export default new AuthService();
