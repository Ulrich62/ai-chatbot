"use client";
import { ChatHeader } from "@/components/chat-header";
import { Messages } from "@/components/messages";
import { MultimodalInput } from "@/components/multimodal-input";
import { MESSAGE_STATUS } from "@/enums";
import { useChat } from "@/hooks/use-chat";
import { useMessages } from "@/hooks/use-messages";
import { useMemo } from "react";

export default function Page() {
  const {
    chatMessages: messages,
    isCreateChatPending,
    createChat,
    chats,
  } = useChat();

  // Get the most recent chat ID from the store
  const currentChatId = chats.length > 0 ? chats[0].id : "";

  const { sendMessage } = useMessages(currentChatId);

  const isNewChat = useMemo(() => {
    return !messages.length;
  }, [messages.length]);

  const handleCreateChat = async (message: string) => {
    if (!isNewChat) {
      sendMessage({
        content: message,
        is_user: true,
      });
      return;
    }
    try {
      await createChat({ title: message });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col min-w-0 h-dvh bg-background">
      <ChatHeader />

      <Messages
        messages={messages}
        loading={isCreateChatPending}
        status={MESSAGE_STATUS.READY}
      />

      <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
        <MultimodalInput
          loading={isCreateChatPending}
          sendMessage={handleCreateChat}
        />
      </form>
    </div>
  );
}
