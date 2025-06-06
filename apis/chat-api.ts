import ENDPOINTS from '@/constants/endpoints';
import { secureClient } from '@/lib/api';

export const getChatHistory = async (params: BasePaginationParams) => {
  const response = await secureClient.get<PaginateList<Chat>>(
    ENDPOINTS.CHAT.HISTORY,
    { params },
  );
  return response.data;
};

export const createChat = async (newChat: NewChatPayload) => {
  const response = await secureClient.post<Chat>(
    ENDPOINTS.CHAT.CREATE_CHAT,
    newChat,
  );
  return response.data;
};

export const getChat = async (id: string) => {
  const response = await secureClient.get<Chat>(ENDPOINTS.CHAT.GET_CHAT(id));
  return response.data;
};

export const sendMessage = async (chatId: string, messages: NewMessage[]) => {
  const response = await secureClient.post<Message[]>(
    ENDPOINTS.MESSAGE.SEND_MESSAGE(chatId),
    { messages },
  );
  return response.data;
};

export const getChatMessages = async (
  chatId: string,
  params: BasePaginationParams,
) => {
  const response = await secureClient.get<PaginateList<Message>>(
    ENDPOINTS.MESSAGE.GET_MESSAGES(chatId),
    { params },
  );
  return response.data;
};
