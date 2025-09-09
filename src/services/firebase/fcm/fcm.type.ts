export type RegisterTokenPayload = {
  accountId: string;
  token: string;
};

export type UnregisterTokenPayload = {
  token: string;
  accountId: string;
};
