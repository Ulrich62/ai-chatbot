const CHAT_PROXY = '/api/chat/proxy';

export const getChatHistory = async (params: BasePaginationParams) => {
  const response = await fetch(
    `${CHAT_PROXY}?${new URLSearchParams(params as any)}`,
  );
  if (!response.ok)
    throw new Error("Erreur lors de la récupération de l'historique");
  return response.json();
};

export const createChat = async (newChat: NewChatPayload) => {
  return await fetch(CHAT_PROXY, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify(newChat),
  });
};

export const getChat = async (id: string) => {
  const response = await fetch(`${CHAT_PROXY}?id=${id}`);
  if (!response.ok) throw new Error('Erreur lors de la récupération du chat');
  return response.json();
};

export const sendMessage = async (payload: {
  chatId: string;
  messages: NewMessage[];
}) => {
  return await fetch(`${CHAT_PROXY}/messages?id=${payload.chatId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify({ messages: payload.messages }),
  });
};

export const getChatMessages = async (
  chatId: string,
  params: BasePaginationParams,
) => {
  const response = await fetch(
    `${CHAT_PROXY}/messages?id=${chatId}&${new URLSearchParams(params as any)}`,
  );
  if (!response.ok)
    throw new Error('Erreur lors de la récupération des messages');
  return response.json();
};
