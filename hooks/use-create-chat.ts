import { useMutation } from '@tanstack/react-query';
import { createChat as createChatApi } from '@/apis/chat-api';
import { toast } from '@/components/toast';
import { TEMP_MSG_ID_PREFIX } from '@/constants';
import { useChatStore } from '@/store/chat-store';

export const useCreateChat = () => {
  const {
    messages: chatMessages,
    addMessages,
    setCurrentChat,
    clearMessages,
    setMessages,
  } = useChatStore.getState();

  const { mutateAsync: createChat, isPending: isCreateChatPending } =
    useMutation<Chat, Error, NewChat>({
      mutationFn: (newChat: NewChat) => {
        console.log('createChat', newChat);

        // Generate a unique temporary ID
        const tempId = `${TEMP_MSG_ID_PREFIX}_${Date.now()}`;

        clearMessages();

        // Add current message to UI immediately
        addMessages([
          {
            id: tempId,
            content: newChat.title,
            is_user: true,
            created_at: new Date().toISOString(),
          },
        ]);

        // Create payload with pending messages
        const payload: NewChatPayload = {
          title: newChat.title,
          messages: [
            {
              content: newChat.title,
              is_user: true,
            },
          ],
        };

        return createChatApi(payload);
      },
      onSuccess: (data) => {
        data?.messages && setMessages(data?.messages);
        setCurrentChat(data);
      },
      onError: (error) => {
        console.error(error);

        toast({
          type: 'error',
          description:
            'Une erreur est survenue lors de la création de la conversation',
        });
      },
    });

  return {
    createChat,
    chatMessages,
    isCreateChatPending,
  };
};
