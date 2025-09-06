import { Role, Status, Provider } from "../../generated/prisma";
import { IBrand } from "../brand/brand.interface";
import { IUser } from "../user/user.interface";
export interface IAccount {
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
  user?: IUser | null;
  brand?: IBrand | null;
}

export interface ISignupPayload {
  name: string;
  email: string;
  password: string;
  role: Extract<Role, "USER" | "BRAND">;
  userName?: string;
}
export interface IVerfiyEmail {
  code: string;
  email: string;
}

export interface ResendVerificationCode {
  email: string;
}

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface IAccessTokenPayload {
  id: string;
  role: Role;
  createdAt: Date;
  status: Status;
  email: string;
}

export interface IRefreshTokenPayload {
  id: string;
  jti: string;
}

export interface IResetTokenPayload {
  purpose: string;
  accountId: string;
  jti: string;
}

export interface IRefreshPayload {
  refreshToken: string;
}

export interface ILogoutPayload {
  refreshToken: string;
}

export interface IForgetPasswordPayload {
  email: string;
}

export interface IVerifyPasswordResetCode {
  code: string;
  email: string;
}

export interface IResetPasswordPayload {
  newPassword: string;
  email: string;
  resetToken: string;
}

export interface IHandleGoogleCallbackPayload extends IAccount {}
