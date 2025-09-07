export const EVENTS = {
  CONNECTION: "connection",
  DISCONNECT: "disconnect",
  // conversation
  CONVERSATION_JOIN: "conversation:join",
  CONVERSATION_LEAVE: "conversation:leave",
  // messages
  MESSAGE_SEND: "message:send",
  MESSAGE_SENT: "message:sent",
  MESSAGE_REACT: "message:react",
  MESSAGE_REACTED: "message:reacted",
  MESSAGE_READ: "message:read",
  MESSAGE_DELETE_FOR_ALL: "message:deleteForAll",
  MESSAGE_DELETED_FOR_ALL: "message:deletedForAll",
  MESSAGE_DELETE_FOR_ME: "message:deleteForMe",
  MESSAGE_DELETED_FOR_ME: "message:deletedForMe",
  MESSAGE_SEARCH: "message:search",
} as const;
