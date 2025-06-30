import { PreviewMessage, ThinkingMessage } from "./message";
import { Greeting } from "./greeting";
import { memo, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { TEMP_MSG_ID_PREFIX } from "@/constants";
import { useScrollToView } from "@/hooks/use-scroll-to-view";
import type { MESSAGE_STATUS } from "@/enums";

interface MessagesProps {
  messages: Array<Message>;
  loading?: boolean;
  status?: MESSAGE_STATUS;
}

function PureMessages({ messages, loading, status }: MessagesProps) {
  const { elementRef: latestMessageRef, scrollToView } = useScrollToView();
  const previousMessagesLengthRef = useRef(0);

  // Memoize expensive calculations
  const { hasMessages, shouldShowThinkingMessage } = useMemo(() => {
    const hasMessages = messages.length > 0;
    const lastMessage = messages[messages.length - 1];
    const shouldShowThinkingMessage =
      lastMessage?.id?.startsWith(TEMP_MSG_ID_PREFIX);

    return {
      hasMessages,
      shouldShowThinkingMessage,
    };
  }, [messages]);

  // Memoize message rendering
  const renderedMessages = useMemo(() => {
    return messages.map((message, index) => (
      <div
        key={`${message.id}-${index}`}
        ref={index === messages.length - 1 ? latestMessageRef : undefined}
        className="scroll-mt-4"
      >
        <PreviewMessage
          message={message}
          requiresScrollPadding={hasMessages && index === messages.length - 1}
        />
      </div>
    ));
  }, [messages, hasMessages, latestMessageRef]);

  // Smooth scroll only when a new user message is added
  useEffect(() => {
    const isNewMessage = messages.length > previousMessagesLengthRef.current;

    if (isNewMessage) {
      const last = messages[messages.length - 1];
      scrollToView({
        behavior: last?.is_user ? "smooth" : "instant",
        block: "start",
      });
    }

    previousMessagesLengthRef.current = messages.length;
  }, [messages, scrollToView]);

  return (
    <div className="flex flex-col flex-1 gap-6 min-w-0 overflow-y-scroll pt-4 relative">
      {!hasMessages && !loading && <Greeting />}

      {renderedMessages}

      {shouldShowThinkingMessage && <ThinkingMessage />}

      <motion.div className="shrink-0 min-w-[24px] min-h-[24px]" />
    </div>
  );
}

export const Messages = memo(PureMessages);
