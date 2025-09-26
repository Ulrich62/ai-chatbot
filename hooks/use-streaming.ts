import { useCallback } from 'react';
import { useMessageStore } from '@/store/message-store';
import { useChatStore } from '@/store/chat-store';
import { TEMP_MSG_ID_PREFIX } from '@/constants';
import { STREAM_STATUS } from '@/enums';
import { processSSEStream } from '@/lib/processSSEStream';
import type { Message, StreamingCallbacks, Chat } from '@/types';

export const useStreaming = () => {
  const {
    addMessages,
    setStreamStatus,
    updateStreamingMessage,
    setCurrentStreamingMessageId,
    completeStreamingMessage,
    replaceMessageId,
  } = useMessageStore();

  const { addChat } = useChatStore();

  const startStreaming = useCallback(
    async (streamFn: () => Promise<Response>, initialMessage: string) => {
      const tempUserId = `${TEMP_MSG_ID_PREFIX}_user_${Date.now()}`;
      const tempBotId = `${TEMP_MSG_ID_PREFIX}_bot_${Date.now()}`;

      // Add user message immediately
      const userMessage: Message = {
        id: tempUserId,
        content: initialMessage,
        is_user: true,
        created_at: new Date().toISOString(),
      };

      // Add empty bot message for streaming
      const botMessage: Message = {
        id: tempBotId,
        content: '',
        is_user: false,
        created_at: new Date().toISOString(),
        isLoading: true,
      };

      addMessages([userMessage, botMessage]);
      setStreamStatus(STREAM_STATUS.STARTING);
      setCurrentStreamingMessageId(tempBotId);

      let accumulatedContent = '';

      const callbacks: StreamingCallbacks = {
        onChatCreated: (data) => {
          const newChat: Chat = {
            id: data.chat_id,
            title: data.title,
            created_at: data.created_at,
          };
          addChat(newChat);

          // Navigate to the new chat if we're on the main page
          if (window.location.pathname === '/') {
            window.history.replaceState({}, '', `/chat/${data.chat_id}`);
          }
        },
        onMessageCreated: (data) => {
          if (data.is_user) {
            replaceMessageId(tempUserId, data.message_id);
          }
          setStreamStatus(STREAM_STATUS.TRANSITIONING);
        },
        onBotResponseStart: () => {
          setStreamStatus(STREAM_STATUS.STREAMING);
        },
        onBotResponseChunk: (data) => {
          accumulatedContent += data.chunk;
          updateStreamingMessage(tempBotId, accumulatedContent);
        },
        onBotResponseComplete: (data) => {
          completeStreamingMessage(tempBotId, data.content);
          replaceMessageId(tempBotId, data.message_id);
        },
        onComplete: () => {
          setStreamStatus(STREAM_STATUS.COMPLETED);
        },
        onError: (error) => {
          console.error('Streaming error:', error);
          setStreamStatus(STREAM_STATUS.ERROR);
        },
      };

      try {
        const response = await streamFn();
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (!response.body) {
          throw new Error('Response body is null');
        }

        await processSSEStream(response.body, callbacks);
      } catch (error) {
        if (error instanceof Error) {
          callbacks.onError?.(error);
        }
      }
    },
    [
      addMessages,
      addChat,
      setStreamStatus,
      updateStreamingMessage,
      setCurrentStreamingMessageId,
      completeStreamingMessage,
      replaceMessageId,
    ],
  );

  return {
    startStreaming,
  };
};
