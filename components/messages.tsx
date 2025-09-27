import { PreviewMessage } from "./message";
import { Greeting } from "./greeting";
import { memo, useEffect, useRef, useMemo, Suspense } from "react";
import { motion } from "framer-motion";
import { useScrollContext } from "@/contexts/scroll-context";
import { MESSAGE_STATUS, STREAM_STATUS } from "@/enums";
import type { Message } from "@/types";

interface MessagesProps {
  messages: Message[];
  loading?: boolean;
  status?: MESSAGE_STATUS;
  streamStatus?: STREAM_STATUS;
}

function PureMessages({ messages, loading, streamStatus }: MessagesProps) {
  const { 
    containerRef, 
    endRef, 
    isAtBottom, 
    scrollToBottom, 
    onViewportEnter, 
    onViewportLeave 
  } = useScrollContext();
  const previousMessagesLengthRef = useRef(0);

  // Memoize expensive calculations
  const { hasMessages } = useMemo(() => {
    const hasMessages = messages.length > 0;
    const lastMessage = messages[messages.length - 1];
    const shouldShowThinkingMessage = lastMessage?.isLoading;

    return {
      hasMessages,
      shouldShowThinkingMessage,
    };
  }, [messages]);

  // Memoize message rendering
  const renderedMessages = useMemo(() => {
    return messages.map((message, index) => {
      return (
        <div
          key={`${message.id}-${index}`}
          className="scroll-mt-4"
        >
          <PreviewMessage
            message={message}
            requiresScrollPadding={hasMessages && index === messages.length - 1}
            loading={message.isLoading}
            streamStatus={streamStatus}
          />
        </div>
      );
    });
  }, [messages, hasMessages, streamStatus]);

  // Smooth scroll only when a new user message is added
  useEffect(() => {
    const isNewMessage = messages.length > previousMessagesLengthRef.current;

    if (isNewMessage) {
      const last = messages[messages.length - 1];
      scrollToBottom(last?.isLoading ? "smooth" : "instant");
    }

    previousMessagesLengthRef.current = messages.length;
  }, [messages, scrollToBottom]);

  return (
    <div 
      ref={containerRef}
      className="flex flex-col flex-1 gap-6 min-w-0 overflow-y-scroll pt-4 relative"
    >
      {!hasMessages && !loading && <Greeting />}

      {renderedMessages}

      <motion.div 
        ref={endRef}
        className="shrink-0 min-w-[24px] min-h-[24px]"
        onViewportEnter={onViewportEnter}
        onViewportLeave={onViewportLeave}
      />
    </div>
  );
}

export const Messages = memo(PureMessages);
