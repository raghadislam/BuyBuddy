import { IAccount } from "../auth/auth.interface";
import { Gender, PaymentMethod } from "../../generated/prisma";

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
  birthDate?: Date;
  landmark?: string;
  paymentMethods: PaymentMethod[];
}

export interface IUpdateUserProfile {
  userName?: string;
  photo?: string;
  phone?: string;
  gender?: Gender;
  government?: string;
  city?: string;
  primaryAddress?: string;
  secondaryAddress?: string;
  landmark?: string;
  paymentMethods: PaymentMethod[];
}
