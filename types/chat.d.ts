export {};

declare global {
  interface ChatMessage {
    id: string;
    text: string;
    is_user: boolean;
  }

  interface Chat {
    id: string;
    title: string;
    messages?: Message[];
    created_at: string;
  }

  interface NewChat {
    title: string;
  }

  interface NewChatPayload {
    title: string;
    messages: NewMessage[];
  }

  interface NewMessage {
    content: string;
    is_user: boolean;
  }

  interface Message {
    content: string;
    is_user: boolean;
    created_at?: string;
    id: string;
    isLoading?: boolean;
  }

  interface ChatMessagePayload {
    chatId: string;
    messages: NewMessage[];
  }

  // SSE Event Types
  interface SSEEvent {
    event: string;
    data: any;
  }

  interface ChatCreatedEvent {
    chat_id: string;
    title: string;
    created_at: string;
  }

  interface MessageCreatedEvent {
    message_id: string;
    content: string;
    is_user: boolean;
    created_at: string;
    chat_id: string;
  }

  interface BotResponseChunkEvent {
    chunk: string;
  }

  interface BotResponseCompleteEvent {
    message_id: string;
    content: string;
    is_user: boolean;
    created_at: string;
    chat_id: string;
  }

  // Streaming Callbacks
  interface StreamingCallbacks {
    onStart?: () => void;
    onChatCreated?: (data: ChatCreatedEvent) => void;
    onMessageCreated?: (data: MessageCreatedEvent) => void;
    onBotResponseStart?: (data: { chat_id: string }) => void;
    onBotResponseChunk?: (data: BotResponseChunkEvent) => void;
    onBotResponseComplete?: (data: BotResponseCompleteEvent) => void;
    onComplete?: () => void;
    onError?: (error: Error) => void;
  }
}
