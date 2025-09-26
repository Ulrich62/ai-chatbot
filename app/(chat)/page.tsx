"use client";
import { ChatHeader } from "@/components/chat-header";
import { Messages } from "@/components/messages";
import { MultimodalInput } from "@/components/multimodal-input";
import { BottomText } from "@/components/bottom-text";
import { MESSAGE_STATUS } from "@/enums";
import { useChat } from "@/hooks/use-chat";
import { useMessages } from "@/hooks/use-messages";
import { useMemo } from "react";

export default function Page() {
  const { isCreateChatPending, createChat, chats } = useChat();

  // Sur la page d'accueil, on ne charge pas de chat existant
  // On utilise useMessages sans chatId pour éviter de charger des messages
  const { sendMessage } = useMessages();

  // Sur la page d'accueil, on est toujours dans un nouveau chat
  const isNewChat = true;
  const messages: any[] = []; // Pas de messages sur la page d'accueil

  const handleCreateChat = async (message: string) => {
    // Sur la page d'accueil, on crée toujours un nouveau chat
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

      {isNewChat && <BottomText />}
    </div>
  );
}
