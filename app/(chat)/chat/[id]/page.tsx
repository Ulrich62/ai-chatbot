"use client";
import React, { use, useMemo } from "react";
import { ChatHeader } from "@/components/chat-header";
import { Messages } from "@/components/messages";
import { MultimodalInput } from "@/components/multimodal-input";
import { BottomText } from "@/components/bottom-text";
import { ScrollProvider } from "@/contexts/scroll-context";
import { MESSAGE_STATUS } from "@/enums";
import { useMessages } from "@/hooks/use-messages";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const {
    chatMessages: messages,
    isSendMessagePending,
    isMessagesLoading,
    sendMessage,
    streamStatus,
  } = useMessages(id);

  const isNewChat = useMemo(() => {
    return !messages.length;
  }, [messages.length]);

  const handleSendMessage = (message: string) => {
    sendMessage({
      content: message,
      is_user: true,
    });
  };

  return (
    <ScrollProvider>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        <ChatHeader />

        <Messages
          messages={messages}
          loading={isMessagesLoading}
          status={MESSAGE_STATUS.READY}
          streamStatus={streamStatus}
        />

        <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
          <MultimodalInput
            loading={isSendMessagePending}
            sendMessage={handleSendMessage}
          />
        </form>

        {isNewChat && <BottomText />}
      </div>
    </ScrollProvider>
  );
}
