"use client";

import cx from "classnames";
import type React from "react";
import { useRef, useEffect, useState, memo, useCallback } from "react";
import { useWindowSize } from "usehooks-ts";

import { ArrowUpIcon, StopIcon } from "./icons";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom";
import {
  ANIMATION_CONFIG,
  AUTO_HEIGHT,
  DEFAULT_HEIGHT,
  DESKTOP_WIDTH,
  MIN_HEIGHT_OFFSET,
} from "@/constants/global";

type MultimodalInputProps = {
  className?: string;
  sendMessage: (message: string) => void;
  stop?: () => void;
  loading?: boolean;
};

function PureMultimodalInput({
  loading,
  className,
  sendMessage,
  stop,
}: MultimodalInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();
  const [input, setInput] = useState("");
  const { isAtBottom, scrollToBottom } = useScrollToBottom();

  // Memoize height adjustment functions
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = AUTO_HEIGHT;
      textarea.style.height = `${textarea.scrollHeight + MIN_HEIGHT_OFFSET}px`;
    }
  }, []);

  const resetHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = AUTO_HEIGHT;
      textarea.style.height = DEFAULT_HEIGHT;
    }
  }, []);

  // Initialize height on mount
  useEffect(() => {
    adjustHeight();
  }, [adjustHeight]);

  // Memoize input change handler
  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(event.target.value);
      adjustHeight();
    },
    [adjustHeight],
  );

  // Memoize form submission
  const submitForm = useCallback(() => {
    if (!input.trim()) return;

    sendMessage(input);
    scrollToBottom("instant");
    setInput("");
    resetHeight();

    // Focus textarea on desktop
    if (width && width > DESKTOP_WIDTH) {
      textareaRef.current?.focus();
    }
  }, [input, sendMessage, scrollToBottom, resetHeight, width]);

  // Memoize keyboard event handler
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (
        event.key === "Enter" &&
        !event.shiftKey &&
        !event.nativeEvent.isComposing
      ) {
        event.preventDefault();

        submitForm();
      }
    },
    [submitForm],
  );

  // Memoize scroll to bottom handler
  const handleScrollToBottom = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      scrollToBottom();
    },
    [scrollToBottom],
  );

  const isSubmitting = loading;
  const canSend = input.trim().length > 0;

  return (
    <div className="relative w-full flex flex-col gap-4">
      <AnimatePresence>
        {!isAtBottom && (
          <motion.div
            {...ANIMATION_CONFIG}
            className="absolute left-1/2 bottom-28 -translate-x-1/2 z-50"
          >
            <Button
              data-testid="scroll-to-bottom-button"
              className="rounded-full"
              size="icon"
              variant="outline"
              onClick={handleScrollToBottom}
            >
              <ArrowDown />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <Textarea
        data-testid="multimodal-input"
        ref={textareaRef}
        placeholder="Envoyer un message..."
        value={input}
        onChange={handleInputChange}
        className={cx(
          "min-h-[24px] max-h-[calc(75dvh)] overflow-hidden resize-none rounded-2xl !text-base bg-muted pb-10 dark:border-zinc-700",
          className,
        )}
        rows={2}
        autoFocus
        onKeyDown={handleKeyDown}
      />

      <div className="absolute bottom-0 right-0 p-2 w-fit flex flex-row justify-end">
        {isSubmitting ? (
          <StopButton stop={stop} />
        ) : (
          <SendButton input={canSend} submitForm={submitForm} />
        )}
      </div>
    </div>
  );
}

export const MultimodalInput = memo(
  PureMultimodalInput,
  (prevProps, nextProps) => {
    // More comprehensive memoization check
    return (
      prevProps.loading === nextProps.loading &&
      prevProps.className === nextProps.className &&
      prevProps.sendMessage === nextProps.sendMessage &&
      prevProps.stop === nextProps.stop
    );
  },
);

type StopButtonProps = {
  stop?: () => void;
};

function PureStopButton({ stop }: StopButtonProps) {
  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      stop?.();
    },
    [stop],
  );

  return (
    <Button
      data-testid="stop-button"
      className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
      onClick={handleClick}
    >
      <StopIcon size={14} />
    </Button>
  );
}

const StopButton = memo(PureStopButton);

type SendButtonProps = {
  submitForm: () => void;
  input: boolean; // Changed to boolean for cleaner prop
};

function PureSendButton({ submitForm, input }: SendButtonProps) {
  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      submitForm();
    },
    [submitForm],
  );

  return (
    <Button
      data-testid="send-button"
      className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
      onClick={handleClick}
      disabled={!input}
    >
      <ArrowUpIcon size={14} />
    </Button>
  );
}

const SendButton = memo(PureSendButton, (prevProps, nextProps) => {
  return (
    prevProps.input === nextProps.input &&
    prevProps.submitForm === nextProps.submitForm
  );
});
