import { useQuery } from "@tanstack/react-query";
import { toast } from "@/components/toast";
import { queries } from "@/lib/query-keys";
import { useMemo } from "react";
import { useMessageStore } from "@/store/message-store";
import { useStreaming } from "./use-streaming";
import { STREAM_STATUS } from "@/enums";
import { sendMessage as sendMessageApi } from "@/apis/chat-api";
import { useUserInfo } from "./use-user-info";
import { useApi } from "./use-api";
import type { Message, NewMessage } from "@/types";

export const useMessages = (chatId?: string) => {
  const {
    messages: chatMessages,
    clearMessages,
    streamStatus,
    currentStreamingMessageId,
  } = useMessageStore();
  const { startStreaming } = useStreaming();
  const { userInfo } = useUserInfo();
  const { get } = useApi();

  const { isLoading: isMessagesLoading, data: messages } = useQuery<Message[]>({
    queryKey: ['chat', 'messages', chatId],
    queryFn: async () => {
      if (!chatId) return [];
      
      const response = await get<Message[]>(`/api/chat/messages?id=${chatId}&page=1&limit=10`);
      
      if (!response.success) {
        throw new Error(response.error || 'Erreur lors de la récupération des messages');
      }
      
      return response.data || [];
    },
    enabled: !!chatId,
    select: (data: Message[]) => {
      const decodedMessages = data.map((message: Message) => ({
        ...message,
        content: message.content,
      }));
      return decodedMessages;
    },
  });

  const sendMessage = async (message: NewMessage) => {
    if (!chatId || !userInfo) return;

    try {
      const payload = {
        chatId,
        messages: [message],
        userInfo,
        existingMessages: allMessages,
      };
      await startStreaming(
        () => sendMessageApi(payload),
        message.content,
      );
    } catch (error) {
      console.error(error);
      toast({
        type: "error",
        description: "Une erreur est survenue lors de l'envoi du message",
      });
    }
  };

  const allMessages = useMemo(() => {
    // D'abord, trier les messages de l'API (qui sont dans l'ordre décroissant)
    const sortedApiMessages = [...(messages ?? [])].sort((a, b) => {
      const dateA = new Date(a.created || a.created_at || 0);
      const dateB = new Date(b.created || b.created_at || 0);
      return dateA.getTime() - dateB.getTime(); // Ordre croissant (plus ancien en premier)
    });

    // Ensuite, trier les messages du store
    const sortedStoreMessages = [...chatMessages].sort((a, b) => {
      const dateA = new Date(a.created || a.created_at || 0);
      const dateB = new Date(b.created || b.created_at || 0);
      return dateA.getTime() - dateB.getTime(); // Ordre croissant (plus ancien en premier)
    });

    // Combiner et trier à nouveau pour s'assurer de l'ordre correct
    const combined = [...sortedApiMessages, ...sortedStoreMessages];
    return combined.sort((a, b) => {
      const dateA = new Date(a.created || a.created_at || 0);
      const dateB = new Date(b.created || b.created_at || 0);
      return dateA.getTime() - dateB.getTime();
    });
  }, [chatMessages, messages]);

  return {
    sendMessage,
    chatMessages: allMessages,
    isSendMessagePending:
      streamStatus === STREAM_STATUS.STREAMING ||
      streamStatus === STREAM_STATUS.STARTING,
    isMessagesLoading,
    clearMessages,
    streamStatus,
    currentStreamingMessageId,
  };
};