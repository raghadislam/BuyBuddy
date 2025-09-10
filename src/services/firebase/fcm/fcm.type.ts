export type RegisterTokenPayload = {
  accountId: string;
  token: string;
};

export type UnregisterTokenPayload = {
  token: string;
  accountId: string;
};

export type SubscribeToTopicPayload = {
  tokens: string[];
  topic: string;
};

export type UnsubscribeFromTopic = SubscribeToTopicPayload;

export type SendToTokensPayload = {
  tokens: string[];
  title: string;
  body: string;
};

export type SendToAccountPayload = {
  accountId: string;
  title: string;
  body: string;
};

export type SendToTopicPayload = {
  topic: string;
  title: string;
  body: string;
};
