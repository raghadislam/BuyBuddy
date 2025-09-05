import { IAccount } from "../auth/auth.interface";
import { Gender } from "../../generated/prisma";

export interface IUser {
  id: string;
  account: IAccount;
  accountId: string;
  userName: string;
  photo?: string;
  phone?: string;
  gender?: Gender;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUpdateUserProfile {
  userName?: string;
  photo?: string;
  phone?: string;
  gender?: Gender;
}
