import { Job } from "bullmq";
import {
  sendVerificationCode,
  sendPasswordResetCode,
  sendAccountVerifiedEmail,
  sendPasswordResetConfirmation,
  sendAccountActivatedEmail,
} from "../../services/email/send";
import logger from "../../config/logger.config";
import APIError from "../../utils/APIError";
import { HttpStatus } from "../../enums/httpStatus.enum";
import {
  BasePayload,
  PasswordResetPayload,
  EmailJobPayload,
  EmailJobName,
  VerificationPayload,
} from "./email.type";

export async function emailProcessor(job: Job) {
  const name = job.name as EmailJobName;
  const data = job.data as EmailJobPayload;

  try {
    logger.info(`Processing email job ${job.id} / ${name}`, {
      attemptsMade: job.attemptsMade,
    });

    switch (name) {
      case "verification": {
        const payload = data as VerificationPayload;
        if (!payload.to || !payload.code) {
          throw new APIError(
            "Missing `to` or `code` for verification email",
            HttpStatus.BadRequest
          );
        }
        await sendVerificationCode(payload.to, payload.code, {
          subject: payload.subject,
        });
        break;
      }

      case "passwordReset": {
        const payload = data as PasswordResetPayload;
        if (!payload.to || !payload.code) {
          throw new APIError(
            "Missing `to` or `code` for passwordReset email",
            HttpStatus.BadRequest
          );
        }
        await sendPasswordResetCode(payload.to, payload.code, {
          subject: payload.subject,
        });
        break;
      }

      case "accountVerified": {
        const payload = data as BasePayload;
        if (!payload.to)
          throw new APIError(
            "Missing `to` for accountVerified email",
            HttpStatus.BadRequest
          );
        await sendAccountVerifiedEmail(payload.to, {
          subject: payload.subject,
          name: payload.name,
        });
        break;
      }

      case "passwordResetConfirmation": {
        const payload = data as BasePayload;
        if (!payload.to)
          throw new APIError(
            "Missing `to` for passwordResetConfirmation",
            HttpStatus.BadRequest
          );
        await sendPasswordResetConfirmation(payload.to, {
          subject: payload.subject,
          name: payload.name,
        });
        break;
      }

      case "accountActivated": {
        const payload = data as BasePayload;
        if (!payload.to)
          throw new APIError(
            "Missing `to` for accountActivated",
            HttpStatus.BadRequest
          );
        await sendAccountActivatedEmail(payload.to, {
          subject: payload.subject,
          name: payload.name,
        });
        break;
      }

      default:
        throw new APIError(
          `Unknown email job name: ${name}`,
          HttpStatus.BadRequest
        );
    }

    logger.info(`Email job ${job.id} (${name}) sent`);
  } catch (err) {
    throw err;
  }
}
