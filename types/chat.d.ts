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
  }
}
