import { PreviewMessage } from "./message";
import { Greeting } from "./greeting";
import { memo, useEffect, useRef, useMemo, Suspense } from "react";
import { motion } from "framer-motion";
import { useScrollToView } from "@/hooks/use-scroll-to-view";
import { MESSAGE_STATUS, STREAM_STATUS } from "@/enums";
import type { Message } from "@/types";

interface MessagesProps {
  messages: Message[];
  loading?: boolean;
  status?: MESSAGE_STATUS;
  streamStatus?: STREAM_STATUS;
}

function PureMessages({ messages, loading, streamStatus }: MessagesProps) {
  const { elementRef: latestMessageRef, scrollToView } = useScrollToView();
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
          ref={index === messages.length - 1 ? latestMessageRef : undefined}
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
  }, [messages, hasMessages, latestMessageRef, streamStatus]);

  // Smooth scroll only when a new user message is added
  useEffect(() => {
    const isNewMessage = messages.length > previousMessagesLengthRef.current;

    if (isNewMessage) {
      const last = messages[messages.length - 1];
      scrollToView({
        behavior: last?.isLoading ? "smooth" : "instant",
        block: "start",
      });
    }

    previousMessagesLengthRef.current = messages.length;
  }, [messages, scrollToView]);

  return (
    <div className="flex flex-col flex-1 gap-6 min-w-0 overflow-y-scroll pt-4 relative">
      {!hasMessages && !loading && <Greeting />}

      {renderedMessages}

      <motion.div className="shrink-0 min-w-[24px] min-h-[24px]" />
    </div>
  );
}

export const Messages = memo(PureMessages);
