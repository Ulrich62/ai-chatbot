import { PreviewMessage, ThinkingMessage } from "./message";
import { Greeting } from "./greeting";
import { memo } from "react";
import type { UseChatHelpers } from "@ai-sdk/react";
import { motion } from "framer-motion";
import { TEMP_MSG_ID_PREFIX } from "@/constants";
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom";

interface MessagesProps {
  status: UseChatHelpers["status"];
  messages: Array<Message>;
  loading?: boolean;
}

function PureMessages({ status, messages, loading }: MessagesProps) {
  const {
    containerRef: messagesContainerRef,
    endRef: messagesEndRef,
    onViewportEnter,
    onViewportLeave,
  } = useScrollToBottom();

  const hasSentMessage = messages?.length > 0;
  const lastMessage = messages?.[messages.length - 1];

  return (
    <div
      ref={messagesContainerRef}
      className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4 relative"
    >
      {!hasSentMessage && !loading && <Greeting />}

      {messages?.map((message, index) => (
        <PreviewMessage
          key={message.id}
          message={message}
          requiresScrollPadding={
            hasSentMessage && index === messages.length - 1
          }
        />
      ))}

      {messages?.length > 0 &&
        lastMessage?.id.startsWith(TEMP_MSG_ID_PREFIX) && <ThinkingMessage />}

      <motion.div
        ref={messagesEndRef}
        className="shrink-0 min-w-[24px] min-h-[24px]"
        onViewportLeave={onViewportLeave}
        onViewportEnter={onViewportEnter}
      />
    </div>
  );
}
export const Messages = memo(PureMessages);
