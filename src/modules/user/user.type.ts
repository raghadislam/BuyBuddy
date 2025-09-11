import { Account } from "../auth/auth.type";
import { Gender, PaymentMethod } from "@prisma/client";

export type User = {
  id: string;
  account?: Account | null;
  accountId?: string | null;
  userName?: string | null;
  photo?: string | null;
  photoPublicId?: string | null;
  phone?: string | null;
  gender?: Gender | null;
  createdAt?: Date;
  updatedAt?: Date;
  birthDate?: Date | null;
  landmark?: string | null;
  paymentMethods?: PaymentMethod[] | null;
};

export type UpdateUserProfile = {
  userName: string;
  photo?: string;
  photoPublicId?: string;
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
