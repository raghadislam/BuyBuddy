import { Role, Status } from "../../generated/prisma";

export interface ISignupPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Extract<Role, "USER" | "SELLER">;
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

export interface IVerfiyEmail {
  code: string;
}
