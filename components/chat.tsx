"use client";

import { ChatHeader } from "@/components/chat-header";
import { MultimodalInput } from "./multimodal-input";
import { Messages } from "./messages";
import { useArtifactSelector } from "@/hooks/use-artifact";

export function Chat({
  id,
  initialMessages,
}: {
  id: string;
  initialMessages: Array<any>;
}) {
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        <ChatHeader />

        <Messages
          chatId={id}
          status={"ready"}
          messages={initialMessages}
          setMessages={() => {}}
          reload={() => Promise.resolve(null)}
          isReadonly={false}
          isArtifactVisible={isArtifactVisible}
        />

        <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
          <MultimodalInput
            chatId={id}
            messages={initialMessages}
            setMessages={() => {}}
            append={async () => null}
            stop={() => {}}
            setInput={() => {}}
            handleSubmit={() => {}}
            status={"ready"}
            input={""}
          />
        </form>
      </div>
    </>
  );
}
