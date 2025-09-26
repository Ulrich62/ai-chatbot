const ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/login',
    REFRESH: '/api/refreshToken',
    USER_INFO: '/api/getUserInfos',
  },
  CHAT: {
    CREATE_CHAT: '/api/v1/sse/chats',
    GET_CHAT: (id: string) => `/api/v1/chats/${id}`,
    HISTORY: '/api/v1/chats',
  },
  MESSAGE: {
    SEND_MESSAGE: (id: string) => `/api/v1/sse/messages/chat/${id}`,
    GET_MESSAGES: (id: string) => `/api/v1/messages/chat/${id}`,
  },
} as const;
export default ENDPOINTS;
