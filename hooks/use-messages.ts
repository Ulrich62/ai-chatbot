import { useMutation, useQuery } from '@tanstack/react-query';
import { sendMessage as sendMessageApi } from '@/apis/chat-api';
import { toast } from '@/components/toast';
import { useChatStore } from '@/store/chat-store';
import { TEMP_MSG_ID_PREFIX } from '@/constants';
import { queries } from '@/lib/query-keys';
import { useMemo } from 'react';

export const useMessages = (chatId?: string) => {
  const chatMessages = useChatStore((state) => state.messages);
  const addMessages = useChatStore((state) => state.addMessages);
  const clearMessages = useChatStore((state) => state.clearMessages);

  const { isLoading: isMessagesLoading, data: messages } = useQuery<Message[]>({
    ...queries.chat.messages({ chatId: chatId as string }),
    enabled: !!chatId,
    select: (data: Message[]) => {
      const decodedMessages = data.map((message: Message) => ({
        ...message,
        content: message.content,
      }));
      return decodedMessages;
    },
  });

  const { mutate: sendMessage, isPending: isSendMessagePending } = useMutation<
    Message[],
    Error,
    NewMessage
  >({
    mutationFn: (message: NewMessage) => {
      // Generate a unique temporary ID
      const tempId = `${TEMP_MSG_ID_PREFIX}_${Date.now()}`;

      // Add current message to UI immediately
      const tempMessage: Message = {
        id: tempId,
        content: message.content,
        is_user: message.is_user,
        created_at: new Date().toISOString(),
      };
      addMessages([tempMessage]);

      return sendMessageApi(chatId as string, [message]);
    },
    onSuccess: (data: Message[]) => {
      const reply = data.find((message: Message) => !message.is_user);
      const userMessage = data.find((message: Message) => message.is_user);
      const tempMessage = data.find((message: Message) =>
        message.id.startsWith(TEMP_MSG_ID_PREFIX),
      );
      if (tempMessage && userMessage) {
        // replaceMessageId(tempMessage.id, userMessage.id);
      }
      reply && addMessages([reply]);
    },
    onError: (error: Error) => {
      console.error(error);

      toast({
        type: 'error',
        description: "Une erreur est survenue lors de l'envoi du message",
      });
    },
  });

  const allMessages = useMemo(() => {
    return [...(messages ?? []), ...chatMessages];
  }, [chatMessages, messages]);

  return {
    sendMessage,
    chatMessages: allMessages,
    isSendMessagePending,
    isMessagesLoading,
    clearMessages,
  };
};
