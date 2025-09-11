export type EmailJobName =
  | "verification"
  | "passwordReset"
  | "accountVerified"
  | "passwordResetConfirmation"
  | "accountActivated";

export interface BasePayload {
  to: string;
  subject?: string;
  name?: string;
}

export interface VerificationPayload extends BasePayload {
  code: string;
  ttlMinutes?: number;
}

export interface PasswordResetPayload extends BasePayload {
  code: string;
}

export type EmailJobPayload =
  | VerificationPayload
  | PasswordResetPayload
  | BasePayload;
