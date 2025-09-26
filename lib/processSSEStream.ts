import type { StreamingCallbacks } from '@/types';

export async function processSSEStream(
  body: ReadableStream<Uint8Array>,
  callbacks: StreamingCallbacks,
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        callbacks.onComplete?.();
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      let currentEvent: string | null = null;

      for (const line of lines) {
        if (line.startsWith('event: ')) {
          currentEvent = line.substring(7).trim();
        } else if (line.startsWith('data: ')) {
          const data = line.substring(6).trim();

          if (data && currentEvent && currentEvent !== 'end') {
            try {
              const parsedData = JSON.parse(data);
              handleSSEEvent(currentEvent, parsedData, callbacks);
            } catch (e) {
              console.error('Failed to parse SSE data:', data);
            }
          }
          currentEvent = null;
        }
      }
    }
  } finally {
    reader?.releaseLock();
  }
}

function handleSSEEvent(
  event: string,
  data: any,
  callbacks: StreamingCallbacks,
): void {
  switch (event) {
    case 'chat_created':
      callbacks.onChatCreated?.(data);
      break;
    case 'bot_response_start':
      callbacks.onBotResponseStart?.(data);
      break;
    case 'bot_response_chunk':
      callbacks.onBotResponseChunk?.(data);
      break;
    case 'end':
      callbacks.onBotResponseComplete?.(data);
      break;
    case 'message_complete':
      callbacks.onComplete?.();
      break;
    default:
      break;
  }
}

export function abort(
  controller: AbortController,
  reader: ReadableStreamDefaultReader<Uint8Array>,
): void {
  controller?.abort();
  reader?.cancel();
}
