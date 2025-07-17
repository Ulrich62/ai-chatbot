"use client";

import cx from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import { forwardRef, memo } from "react";
import { Markdown } from "./markdown";
import equal from "fast-deep-equal";
import { cn, sanitizeText } from "@/lib/utils";
import { ROLES, STREAM_STATUS } from "@/enums";
import { BotIcon } from "./icons/BotIcon";

type PurePreviewMessageProps = {
  message: Message;
  requiresScrollPadding: boolean;
  loading?: boolean;
  streamStatus?: STREAM_STATUS;
};

const PurePreviewMessage = ({
  message,
  requiresScrollPadding,
  loading,
  streamStatus,
}: PurePreviewMessageProps) => {
  const role = message.is_user ? ROLES.USER : ROLES.ASSISTANT;

  // Clean the message content for display
  const cleanedContent = sanitizeText(message.content);

  // Determine if we're in transition
  const isTransitioning =
    streamStatus === STREAM_STATUS.TRANSITIONING || loading;

  return (
    <AnimatePresence>
      {loading ? (
        <motion.div
          data-testid="message-assistant-loading"
          className="w-full mx-auto max-w-3xl px-4 group/message min-h-96 animate-fadeIn"
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 1, transition: { delay: 0.25 } }}
          data-role={role}
        >
          <div
            className={cx(
              "flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl",
              {
                "group-data-[role=user]/message:bg-muted": true,
              }
            )}
          >
            <AssistantAvatar />

            <motion.div
              className={`flex items-center transition-all duration-300 ${
                isTransitioning
                  ? "opacity-50 scale-95"
                  : "opacity-100 scale-100"
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <span className={isTransitioning ? "animate-pulse" : ""}>
                {cleanedContent}
              </span>
              <motion.span
                className={`italic transition-opacity duration-300 text-muted-foreground ${
                  isTransitioning ? "opacity-0" : "opacity-100"
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                En cours de réflexion...
              </motion.span>
            </motion.div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          data-testid={`message-${role}`}
          className="w-full mx-auto max-w-3xl px-4 group/message animate-fadeIn"
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          data-role={role}
          role="article"
          aria-label={`Message from ${role}`}
        >
          <div
            className={cn(
              "flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-[70%]",
              {
                "group-data-[role=user]/message:w-fit": true,
              }
            )}
          >
            {role === ROLES.ASSISTANT && <AssistantAvatar />}

            <div
              className={cn("flex flex-col gap-4 w-full", {
                "min-h-96": role === ROLES.ASSISTANT && requiresScrollPadding,
              })}
            >
              <div className="flex flex-row gap-2 items-start">
                <motion.div
                  data-testid="message-content"
                  className={cn(
                    "flex flex-col gap-4 transition-all duration-500",
                    {
                      "bg-[#1C539B] text-white px-3 py-2 rounded-xl":
                        message.is_user,
                      "animate-fadeInUp": isTransitioning,
                      "opacity-100": !isTransitioning,
                    }
                  )}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.5,
                      type: "spring",
                      stiffness: 50,
                    },
                  }}
                >
                  <Markdown>{cleanedContent}</Markdown>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.message.id !== nextProps.message.id) return false;
    if (prevProps.requiresScrollPadding !== nextProps.requiresScrollPadding)
      return false;
    if (prevProps.loading !== nextProps.loading) return false;
    if (!equal(prevProps.message.content, nextProps.message.content))
      return false;

    return true;
  }
);

const AssistantAvatar = () => {
  return (
    <div className="size-6 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
      <BotIcon color="#1C539B" />
    </div>
  );
};
