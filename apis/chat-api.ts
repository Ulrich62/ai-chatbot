import type { PaginationParams, NewChatPayload, NewMessage, Message } from '@/types';
import { buildConversationContext, buildUserInfo } from '@/lib/context-builder';

const CHAT_API = '/api/chat';
const MESSAGES_API = '/api/chat/messages';

export const getChatHistory = async (params: PaginationParams) => {
  const searchParams = new URLSearchParams();
  
  if (params.limit) {
    searchParams.set('limit', params.limit.toString());
  }
  
  if (params.start_id) {
    searchParams.set('start_id', params.start_id.toString());
  }
  
  if (params.search) {
    searchParams.set('search', params.search);
  }

  const response = await fetch(`${CHAT_API}?${searchParams}`);
  if (!response.ok)
    throw new Error("Erreur lors de la récupération de l'historique");
  return response.json();
};

export const createChat = async (newChat: NewChatPayload, userInfo: any, existingMessages: Message[] = []) => {
  // Construire le contexte avec les messages existants et le nouveau message
  const context = buildConversationContext(existingMessages, newChat.messages[0]);
  const user = buildUserInfo(userInfo);

  const payload = {
    title: newChat.title,
    messages: {
      messages: newChat.messages,
      context: context,
      user_info: user
    }
  };

  return await fetch(CHAT_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify(payload),
  });
};

export const getChat = async (id: string) => {
  const response = await fetch(`${CHAT_API}?id=${id}`);
  if (!response.ok) throw new Error('Erreur lors de la récupération du chat');
  return response.json();
};

export const sendMessage = async (payload: {
  chatId: string;
  messages: NewMessage[];
  userInfo: any;
  existingMessages: Message[];
}) => {
  // Construire le contexte avec les messages existants et le nouveau message
  const context = buildConversationContext(payload.existingMessages, payload.messages[0]);
  const user = buildUserInfo(payload.userInfo);

  const requestPayload = {
    messages: payload.messages,
    context: context,
    user_info: user
  };

  return await fetch(`${MESSAGES_API}?id=${payload.chatId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify(requestPayload),
  });
};

export const getChatMessages = async (
  chatId: string,
  params: PaginationParams,
) => {
  const searchParams = new URLSearchParams();
  searchParams.set('id', chatId);
  
  if (params.limit) {
    searchParams.set('limit', params.limit.toString());
  }
  
  if (params.start_id) {
    searchParams.set('start_id', params.start_id.toString());
  }

  const response = await fetch(`${MESSAGES_API}?${searchParams}`);
  if (!response.ok)
    throw new Error('Erreur lors de la récupération des messages');
  return response.json();
};
