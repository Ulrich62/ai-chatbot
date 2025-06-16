"use client";

import cx from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import { memo } from "react";
import { Markdown } from "./markdown";
import equal from "fast-deep-equal";
import { cn, sanitizeText } from "@/lib/utils";
import { ROLES } from "@/enums";
import { BotIcon } from "./icons/BotIcon";

type PurePreviewMessageProps = {
  message: Message;
  requiresScrollPadding: boolean;
};

const PurePreviewMessage = ({
  message,
  requiresScrollPadding,
}: PurePreviewMessageProps) => {
  const role = message.is_user ? ROLES.USER : ROLES.ASSISTANT;

  return (
    <AnimatePresence>
      <motion.div
        data-testid={`message-${role}`}
        className="w-full mx-auto max-w-3xl px-4 group/message"
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
            },
          )}
        >
          {role === ROLES.ASSISTANT && <AssistantAvatar />}

          <div
            className={cn("flex flex-col gap-4 w-full", {
              "min-h-96": role === ROLES.ASSISTANT && requiresScrollPadding,
            })}
          >
            <div className="flex flex-row gap-2 items-start">
              <div
                data-testid="message-content"
                className={cn("flex flex-col gap-4", {
                  "bg-[#1C539B] text-white px-3 py-2 rounded-xl":
                    message.is_user,
                })}
              >
                <Markdown>{sanitizeText(message.content)}</Markdown>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.message.id !== nextProps.message.id) return false;
    if (prevProps.requiresScrollPadding !== nextProps.requiresScrollPadding)
      return false;
    if (!equal(prevProps.message.content, nextProps.message.content))
      return false;

    return true;
  },
);

export const ThinkingMessage = () => {
  const role = "assistant";

  return (
    <motion.div
      data-testid="message-assistant-loading"
      className="w-full mx-auto max-w-3xl px-4 group/message min-h-96"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 0.5 } }}
      data-role={role}
    >
      <div
        className={cx(
          "flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl",
          {
            "group-data-[role=user]/message:bg-muted": true,
          },
        )}
      >
        <AssistantAvatar />

        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-4 text-muted-foreground">
            En cours de réflexion...
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const AssistantAvatar = () => {
  return (
    <div className="size-6 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
      <BotIcon color="#1C539B" />
    </div>
  );
};
