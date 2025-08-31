import env from "../../config/env.config";
import {
  ISignupPayload,
  IVerfiyEmail,
  ILoginPayload,
  IRefreshPayload,
  ILogoutPayload,
  IForgetPasswordPayload,
  IResetPasswordPayload,
} from "./auth.interface";
import prisma from "../../config/prisma.config";
import APIError from "../../utils/APIError";
import { Status } from "../../enums/status.enum";
import { RevokedReason } from "../../generated/prisma";
import {
  sendVerificationCode,
  sendAccountVerifiedEmail,
  sendPasswordResetCode,
  sendPasswordResetConfirmation,
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
import { generateNumericCode, hashCode, compareCode } from "./code.util";

class AuthService {
  private async generateAndSendVerificationCode(
    subject: string,
    email: string
  ) {
    const code = generateNumericCode();
    const hashed = await hashCode(code);

    const ttl = env.EMAIL_VERIFICATION_TTL_MINUTES;
    const expiresAt = new Date(Date.now() + ttl * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: {
        verificationCode: hashed,
        verificationCodeExpiresAt: expiresAt,
      },
    });

    await sendVerificationCode(email, code, {
      subject,
    });
  }

  private async generateAndSendPasswordResetCode(
    subject: string,
    email: string
  ) {
    const code = generateNumericCode();
    const hashed = await hashCode(code);

    const ttl = env.PASSWORD_RESET_TTL_MINUTES;
    const expiresAt = new Date(Date.now() + ttl * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: {
        passwordResetCode: hashed,
        passwordResetCodeExpiresAt: expiresAt,
      },
    });

    await sendPasswordResetCode(email, code, {
      subject,
    });
  }

  async signup(payload: ISignupPayload) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: payload.email },
      select: userSafeSelect,
    });

    if (existingUser) {
      // Reactivate account if inactive
      if (existingUser.status === Status.INACTIVE) {
        await this.generateAndSendVerificationCode(
          "Activate your account",
          existingUser.email
        );

        return existingUser;
      }

      // Resend verification code if unverified
      if (existingUser.status === Status.UNVERIFIED) {
        await this.generateAndSendVerificationCode(
          "Verify your email",
          existingUser.email
        );

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

    const code = generateNumericCode();
    const hashed = await hashCode(code);

    // Send verification code
    await this.generateAndSendVerificationCode("Verify your email", user.email);

    logger.info(
      `New user registered ID: ${user.id}, name: ${user.firstName} ${user.lastName}`
    );
    return user;
  }

  async verfyEmail(payload: IVerfiyEmail) {
    const { email, code } = payload;

    // Find user by email with only fields needed for verification
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        verificationCode: true,
        verificationCodeExpiresAt: true,
      },
    });

    // If no user found, return 404 (email does not exist)
    if (!existingUser) {
      throw new APIError("Invalid email", 404);
    }

    // If user has no verification code stored, ask to request a new one
    if (!existingUser.verificationCode) {
      throw new APIError(
        "Verification code not found. Please request a new one.",
        400
      );
    }

    // Check if verification code has expired
    if (
      !existingUser.verificationCodeExpiresAt ||
      existingUser.verificationCodeExpiresAt <= new Date()
    ) {
      throw new APIError("Invalid or expired verification code.", 400);
    }

    // Compare provided code with stored hashed code
    const ok = await compareCode(code, existingUser.verificationCode);
    if (!ok) {
      throw new APIError("Invalid or expired verification code.", 400);
    }

    // Update user to ACTIVE and clear verification fields after successful validation
    const user = await prisma.user.update({
      where: { email },
      data: {
        status: Status.ACTIVE,
        verificationCode: null,
        verificationCodeExpiresAt: null,
      },
      select: userSafeSelect,
    });

    // If update somehow failed, return server error
    if (!user) {
      throw new APIError("Failed to verify email", 500);
    }

    // Generate access & refresh tokens for the verified user
    const accessToken = generateAccessToken({
      id: user.id,
      role: user.role,
      createdAt: user.createdAt,
      status: user.status,
      email: user.email,
    });
    const refreshToken = await generateRefreshToken({ id: user.id });

    // Send email notification that account has been verified
    await sendAccountVerifiedEmail(user.email, {
      subject: "Verify your email",
      firstName: user.firstName,
    });

    // Log verification for auditing/debugging
    logger.info(
      `User verified ID: ${user.id}, name: ${user.firstName} ${user.lastName}`
    );

    // Return verified user and tokens
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
      await this.generateAndSendVerificationCode(
        "Verify your email",
        user.email
      );

      throw new APIError("Please verify your email to continue", 403);
    }

    // If user is inactive, resend activation code and block login
    if (user.status === Status.INACTIVE) {
      await this.generateAndSendVerificationCode(
        "Activate your account",
        user.email
      );

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
      await this.generateAndSendVerificationCode(
        "Verify your email",
        user.email
      );

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

  async forgetPassword(payload: IForgetPasswordPayload) {
    const { email } = payload;
    const user = await prisma.user.findUnique({ where: { email } });

    // If no user found, return 404 (email does not exist)
    if (!user) {
      throw new APIError("No account found with this email address.", 404);
    }

    // Send reset password code
    await this.generateAndSendPasswordResetCode(
      "Your password reset code",
      email
    );

    logger.info(
      `Password reset code sent to user ID: ${user.id}, email: ${user.email}`
    );
    return;
  }

  async resetPassword(payload: IResetPasswordPayload) {
    const { code, newPassword, email } = payload;

    // Find user with password reset fields only
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        firstName: true,
        email: true,
        passwordResetCode: true,
        passwordResetCodeExpiresAt: true,
      },
    });

    // If no user found, return 404
    if (!existingUser) {
      throw new APIError("No account found with this email address.", 404);
    }

    // If no reset code is stored, ask user to request a new one
    if (!existingUser.passwordResetCode) {
      throw new APIError(
        "No reset code found. Please request a new password reset.",
        400
      );
    }

    // Check if reset code has expired
    if (
      !existingUser.passwordResetCodeExpiresAt ||
      existingUser.passwordResetCodeExpiresAt <= new Date()
    ) {
      throw new APIError(
        "Your reset code has expired. Please request a new one.",
        400
      );
    }

    // Validate provided code against stored hashed code
    const ok = await compareCode(code, existingUser.passwordResetCode);
    if (!ok) {
      throw new APIError(
        "The reset code you entered is invalid. Please try again or request a new one.",
        400
      );
    }

    // Hash the new password before storing
    const hashedPassword = await hashPassword(newPassword);

    // Update user: clear reset fields, set new password, ensure ACTIVE status
    const user = await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        status: Status.ACTIVE,
        passwordResetCode: null,
        passwordResetCodeExpiresAt: null,
      },
      select: userSafeSelect,
    });

    if (!user) {
      throw new APIError(
        "Something went wrong while resetting your password. Please try again.",
        500
      );
    }

    // Revoke all previous refresh tokens for security after password change
    await prisma.refreshToken.updateMany({
      where: {
        userId: user.id,
        revokedReason: null,
      },
      data: {
        revokedReason: RevokedReason.PASSWORD_CHANGE,
      },
    });

    // Generate fresh tokens
    const accessToken = generateAccessToken({
      id: user.id,
      role: user.role,
      createdAt: user.createdAt,
      status: user.status,
      email: user.email,
    });
    const refreshToken = await generateRefreshToken({ id: user.id });

    // Send confirmation email
    await sendPasswordResetConfirmation(user.email, {
      subject: "Your password has been reset successfully",
      firstName: user.firstName,
    });

    logger.info(
      `Password successfully reset for user ID: ${user.id}, email: ${user.email}`
    );

    return { accessToken, refreshToken };
  }
}

export default new AuthService();
