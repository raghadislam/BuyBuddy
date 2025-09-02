import passport from "passport";
import crypto from "crypto";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";

import prisma from "./prisma.config";
import env from "./env.config";
import { HttpStatus } from "../enums/httpStatus.enum";
import APIError from "../utils/APIError";
import { hashPassword } from "../utils/functions/hash";
import { Status } from "../enums/status.enum";
import { Provider } from "../enums/provider.enum";
import { IUser } from "../modules/user/user.interface";
import { userSafeSelect } from "../modules/user/user.select";
import { sendAccountActivatedEmail } from "../services/email/send";
import logger from "./logger.config";

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
    },
    // typed callback: the `done` (cb) signature is (err, user?, info?)
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      cb: (err: any, user?: IUser | false) => void
    ) => {
      try {
        // Prefer profile._json.email_verified, fallback to profile.emails
        const email =
          (profile._json && (profile._json as any).email) ||
          profile.emails?.[0]?.value;
        const emailVerified =
          (profile._json && (profile._json as any).email_verified) ??
          profile.emails?.[0]?.verified ??
          false;

        if (!email) {
          return cb(
            new APIError(
              "Google profile does not contain an email.",
              HttpStatus.BadRequest
            ),
            false
          );
        }

        if (!emailVerified) {
          return cb(
            new APIError(
              "Your Google account email is not verified.",
              HttpStatus.Unauthorized
            ),
            false
          );
        }

        // Generate a secure random password (only to satisfy DB if password is required)
        const randomPassword = crypto.randomBytes(32).toString("hex");
        const hashedPassword = await hashPassword(randomPassword);

        const name = (
          profile.displayName ||
          (profile._json && (profile._json as any).name) ||
          "user"
        ).trim();
        const providerId = profile.id;

        // Try to find existing safe user
        const existingUser = await prisma.user.findUnique({
          where: { email },
          select: userSafeSelect,
        });

        if (existingUser) {
          // If account suspended — bail out
          if (existingUser.status === Status.SUSPENDED) {
            return cb(
              new APIError(
                "Your account has been suspended. Please contact support.",
                HttpStatus.Forbidden
              ),
              false
            );
          }

          // If the existing user was UNVERIFIED or INACTIVE but Google email is verified,
          // promote to ACTIVE and attach provider/providerId (keep other safe fields)
          if (existingUser.status !== Status.ACTIVE) {
            await prisma.user.update({
              where: { email },
              data: {
                status: Status.ACTIVE,
                provider: Provider.GOOGLE,
                providerId,
                // clear verification tokens if your schema uses them:
                verificationCode: null,
                verificationCodeExpiresAt: null,
              },
            });

            // optionally notify user about activation
            try {
              await sendAccountActivatedEmail(email, {
                subject: "Activate your account",
                name: existingUser.name,
              });
            } catch (e) {
              // don't fail the login if email sending fails; just log it
              logger.warn("Failed to send activation email:", e);
            }
          } else {
            // Ensure provider fields set for active user
            await prisma.user.update({
              where: { email },
              data: {
                provider: Provider.GOOGLE,
                providerId,
              },
            });
          }

          // Return the safe-selected user (re-fetch with select)
          const user = await prisma.user.findUnique({
            where: { email },
            select: userSafeSelect,
          });

          return cb(null, user as IUser);
        }

        // No existing user -> create (use select to avoid returning password)
        const created = await prisma.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            provider: Provider.GOOGLE,
            providerId,
            status: Status.ACTIVE,
          },
          select: userSafeSelect,
        });

        return cb(null, created as IUser);
      } catch (err) {
        // Passport expects the error to be passed to the callback, not thrown.
        logger.error("GoogleStrategy error:", err);
        return cb(
          err instanceof APIError
            ? err
            : new APIError(
                "Something went wrong while doing google auth",
                HttpStatus.InternalServerError
              ),
          false
        );
      }
    }
  )
);

export default passport;
