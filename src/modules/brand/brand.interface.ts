import { IAccount } from "../auth/auth.interface";
import { BrandStatus, Category, PaymentMethod } from "../../generated/prisma";

export interface IBrand {
  id: string;
  account: IAccount;
  accountId: string;
  description?: string;
  logo?: string;
  category: Category[];
  status: BrandStatus;
  instagramUrl?: string;
  tiktokUrl?: string;
  bussinessPhone?: String;
  ownerName?: string;
  ownerNationalId?: string;
  ownerPhone?: string;
  crn?: string;
  taxId?: string;
  paymentMethod: PaymentMethod[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUpdateBrandProfile {
  description?: string;
  logo?: string;
  categories: Category[];
  instagramUrl?: string;
  tiktokUrl?: string;
  bussinessPhone?: string;
  ownerName?: string;
  ownerNationalId?: string;
  ownerPhone?: string;
  crn?: string;
  taxId?: string;
  paymentMethods: PaymentMethod[];
}
