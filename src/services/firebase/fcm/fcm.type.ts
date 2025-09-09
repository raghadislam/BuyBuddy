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
