import { IAccount } from "../modules/auth/auth.interface";

declare global {
  namespace Express {
    export interface Account extends IAccount {}
    interface Request {
      account?: IAccount;
    }
  }
}
