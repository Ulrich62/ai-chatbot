const ENDPOINTS = {
  AUTH: {
    LOGIN: '/login/',
    REFRESH: '/testJWTRequest/',
  },
  CHAT: {
    CREATE_CHAT: '/chats',
    GET_CHAT: (id: string) => `/chats/${id}`,
    HISTORY: '/chats',
  },
  MESSAGE: {
    SEND_MESSAGE: (id: string) => `/messages/chat/${id}`,
    GET_MESSAGES: (id: string) => `/messages/chat/${id}`,
  },
} as const;
export default ENDPOINTS;
