import { Socket } from "socket.io";

export type CustomSocket = Socket & { data: { accountId?: string } };

export type SocketData = {
  accountId?: string;
};
