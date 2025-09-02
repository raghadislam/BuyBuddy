import { IUser } from "../modules/user/user.interface";

declare global {
  namespace Express {
    export interface User extends IUser {}
    interface Request {
      user?: IUser;
    }
  }
}
