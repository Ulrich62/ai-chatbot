'use client';

import { ChatHeader } from '@/components/chat-header';
import { MultimodalInput } from './multimodal-input';
import { Messages } from './messages';
import { MESSAGE_STATUS } from '@/enums';
import { useEffect } from 'react';
import { useScrollToBottom } from '@/hooks/use-scroll-to-bottom';
import { useMessages } from '@/hooks/use-messages';

type ChatProps = {
  id?: string;
};

export function Chat({ id }: ChatProps) {
  const { scrollToBottom } = useScrollToBottom();

  const { chatMessages: messages, isMessagesLoading } = useMessages(id);

  useEffect(() => {
    scrollToBottom('instant');
  }, [scrollToBottom, id, messages]);

  console.log('render in chat');

  return (
    <div className="flex flex-col min-w-0 h-dvh bg-background">
      <ChatHeader />

      <Messages
        messages={messages}
        loading={isMessagesLoading}
        chatId={id}
        status={MESSAGE_STATUS.READY}
      />

      <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
        <MultimodalInput chatId={id} status={MESSAGE_STATUS.READY} />
      </form>
    </div>
  );
}
