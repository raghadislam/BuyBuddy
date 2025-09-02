import { Role, Status } from "../../generated/prisma";

import { IUser } from "../user/user.interface";
export interface ISignupPayload {
  name: string;
  email: string;
  password: string;
  role: Extract<Role, "USER" | "SELLER">;
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

export interface IHandleGoogleCallbackPayload extends IUser {}
