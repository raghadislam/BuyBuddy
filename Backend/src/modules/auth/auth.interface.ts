import { Role, Status } from "../../generated/prisma";

export interface ISignupPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Extract<Role, "USER" | "SELLER">;
}
export interface IVerfiyEmail {
  code: string;
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
}
