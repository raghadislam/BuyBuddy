import { Role, Status, Provider } from "../../generated/prisma";
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

export interface IRefreshPayload {
  refreshToken: string;
}

export interface ILogoutPayload {
  refreshToken: string;
}

export interface IForgetPasswordPayload {
  email: string;
}

export interface IResetPasswordPayload {
  code: string;
  newPassword: string;
  email: string;
}

export interface IHandleGoogleCallbackPayload extends IAccount {}
