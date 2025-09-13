import { Account } from "../modules/auth/auth.type";

declare global {
  namespace Express {
    interface Request {
      account?: Account;
      image: Multer.File;
    }
  }
}
