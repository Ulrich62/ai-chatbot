// Centralized type definitions for the application

// ===== AUTH TYPES =====
export interface User {
  uuid: string;
  label: string;
  fname: string;
  name: string;
  email?: string;
  id?: number;
  role?: any;
  specialities?: any[];
  companies?: any[];
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  error?: string;
}

// ===== CHAT TYPES =====
export interface Message {
  id: string;
  uuid?: string;
  content: string;
  is_user: boolean;
  created?: string;
  created_at?: string;
  isLoading?: boolean;
  isStreaming?: boolean;
  isComplete?: boolean;
}

export interface NewMessage {
  content: string;
  is_user: boolean;
}

export interface Chat {
  id: string;
  uuid?: string;
  title: string;
  messages?: Message[];
  created?: string;
  created_at?: string;
}

export interface NewChat {
  title: string;
}

export interface NewChatPayload {
  title: string;
  messages: NewMessage[];
}

export interface ChatMessagePayload {
  chatId: string;
  messages: NewMessage[];
  userInfo: any;
  existingMessages: Message[];
}

// ===== NEW API TYPES =====
export interface ConversationContext {
  conversation_history: Array<{
    content: string;
    is_user: boolean;
    timestamp: string;
    uuid?: string;
  }>;
  total_messages: number;
  context_length: number;
}

export interface UserInfo {
  uuid: string;
  email: string;
  name: string;
  fname: string;
  label: string;
  id: number;
  role: any;
  specialities: any[];
  companies: any[];
}

export interface NewChatRequest {
  title: string;
  messages: {
    messages: NewMessage[];
    context: string; // JSON string
    user_info: UserInfo;
  };
}

export interface NewMessageRequest {
  messages: NewMessage[];
  context: string; // JSON string
  user_info: UserInfo;
}

// ===== STREAMING TYPES =====
export interface SSEEvent {
  event: string;
  data: unknown;
}

export interface ChatCreatedEvent {
  chat_id: string;
  title: string;
  created_at: string;
}

export interface MessageCreatedEvent {
  message_id: string;
  content: string;
  is_user: boolean;
  created_at: string;
  chat_id: string;
}

export interface BotResponseChunkEvent {
  chunk: string;
}

export interface BotResponseCompleteEvent {
  message_id: string;
  content: string;
  is_user: boolean;
  created_at: string;
  chat_id: string;
}

export interface StreamingCallbacks {
  onStart?: () => void;
  onChatCreated?: (data: ChatCreatedEvent) => void;
  onMessageCreated?: (data: MessageCreatedEvent) => void;
  onBotResponseStart?: (data: { chat_id: string }) => void;
  onBotResponseChunk?: (data: BotResponseChunkEvent) => void;
  onBotResponseComplete?: (data: BotResponseCompleteEvent) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

// ===== API TYPES =====
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

// ===== COMPONENT PROPS TYPES =====
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

// ===== UTILITY TYPES =====
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ===== ENUM TYPES =====
export enum MESSAGE_STATUS {
  READY = 'ready',
  SUBMITTED = 'submitted',
  STREAMING = 'streaming',
  ERROR = 'error',
}

export enum STREAM_STATUS {
  IDLE = 'idle',
  STARTING = 'starting',
  STREAMING = 'streaming',
  TRANSITIONING = 'transitioning',
  COMPLETED = 'completed',
  ERROR = 'error',
}

// ===== ERROR TYPES =====
export interface AppError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ValidationError {
  field: string;
  message: string;
}

// ===== THEME TYPES =====
export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    foreground: string;
    muted: string;
    accent: string;
    destructive: string;
    border: string;
    input: string;
    ring: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}
