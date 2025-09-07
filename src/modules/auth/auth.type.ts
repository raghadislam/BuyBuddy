import { Role, Status, Provider } from "../../generated/prisma";
import { Brand } from "../brand/brand.type";
import { User } from "../user/user.type";

export type Account = {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
  status: Status;
  verificationCode?: String;
  verificationCodeExpiresAt?: Date;
  passwordResetCode?: String;
  passwordResetCodeExpiresAt?: Date;
  provider: Provider;
  providerId?: string | null;
  user?: User | null;
  brand?: Brand | null;
};

export type SignupPayload = {
  name: string;
  email: string;
  password: string;
  role: Extract<Role, "USER" | "BRAND">;
  userName?: string;
};
export type VerfiyEmail = {
  code: string;
  email: string;
};

export type esendVerificationCode = {
  email: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type AccessTokenPayload = {
  id: string;
  role: Role;
  createdAt: Date;
  status: Status;
  email: string;
};

export type RefreshTokenPayload = {
  id: string;
  jti: string;
};

export type ResetTokenPayload = {
  purpose: string;
  accountId: string;
  jti: string;
};

export type RefreshPayload = {
  refreshToken: string;
};

export type LogoutPayload = {
  refreshToken: string;
};

export type ForgetPasswordPayload = {
  email: string;
};

export type VerifyPasswordResetCode = {
  code: string;
  email: string;
};

export type ResetPasswordPayload = {
  newPassword: string;
  email: string;
  resetToken: string;
};

export type HandleGoogleCallbackPayload = Account;

export type ResendVerificationCode = {
  email: string;
};
