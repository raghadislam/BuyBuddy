import { ISignupPayload } from "./auth.interface";
import prisma from "../../config/prisma.config";
import APIError from "../../utils/APIError";
import { Status } from "../../enums/status.enum";
import { sendVerificationCode } from "../../services/email/send";
import { hashPassword } from "../../utils/functions/hash";

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
        return;
      }

      // Resend verification code if unverified
      if (existingUser.status === Status.UNVERIFIED) {
        sendVerificationCode(existingUser.email, {
          subject: "Verify your email",
        });
        return;
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
    return;
  }
}

export default new AuthService();
