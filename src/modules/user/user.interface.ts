import { Role, Status } from "../../generated/prisma";

export interface IUser {
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
}
