const CHAT_PROXY = '/api/chat/proxy';

export const getChatHistory = async (params: BasePaginationParams) => {
  const response = await fetch(`${CHAT_PROXY}?${new URLSearchParams(params as any)}`);
  if (!response.ok) throw new Error('Erreur lors de la récupération de l\'historique');
  return response.json();
};

export const createChat = async (newChat: NewChatPayload) => {
  const response = await fetch(CHAT_PROXY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newChat),
  });
  if (!response.ok) throw new Error('Erreur lors de la création du chat');
  return response.json();
};

export const getChat = async (id: string) => {
  const response = await fetch(`${CHAT_PROXY}?id=${id}`);
  if (!response.ok) throw new Error('Erreur lors de la récupération du chat');
  return response.json();
};

export const sendMessage = async (chatId: string, messages: NewMessage[]) => {
  const response = await fetch(`${CHAT_PROXY}/messages?id=${chatId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });
  if (!response.ok) throw new Error('Erreur lors de l\'envoi du message');
  return response.json();
};

export const getChatMessages = async (
  chatId: string,
  params: BasePaginationParams,
) => {
  const response = await fetch(`${CHAT_PROXY}/messages?id=${chatId}&${new URLSearchParams(params as any)}`);
  if (!response.ok) throw new Error('Erreur lors de la récupération des messages');
  return response.json();
};
