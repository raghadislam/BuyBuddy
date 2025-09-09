import { Account } from "../auth/auth.type";
import { Gender, PaymentMethod } from "@prisma/client";

export type User = {
  id: string;
  account: Account;
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
};

export type UpdateUserProfile = {
  userName: string;
  photo?: string;
  phone?: string;
  gender?: Gender;
  government?: string;
  city?: string;
  primaryAddress?: string;
  secondaryAddress?: string;
  landmark?: string;
  birthDate?: Date;
  paymentMethods: PaymentMethod[];
};
