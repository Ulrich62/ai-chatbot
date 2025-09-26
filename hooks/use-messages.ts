import { useQuery } from "@tanstack/react-query";
import { toast } from "@/components/toast";
import { queries } from "@/lib/query-keys";
import { useMemo } from "react";
import { useMessageStore } from "@/store/message-store";
import { useStreaming } from "./use-streaming";
import { STREAM_STATUS } from "@/enums";
import { sendMessage as sendMessageApi } from "@/apis/chat-api";
import type { Message, NewMessage } from "@/types";

export const useMessages = (chatId?: string) => {
  const {
    messages: chatMessages,
    clearMessages,
    streamStatus,
    currentStreamingMessageId,
  } = useMessageStore();
  const { startStreaming } = useStreaming();

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

  const sendMessage = async (message: NewMessage) => {
    if (!chatId) return;

    try {
      const payload = {
        chatId,
        messages: [message],
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
    return [...(messages ?? []), ...chatMessages];
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
