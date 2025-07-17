export enum ROLES {
  USER = 'user',
  ASSISTANT = 'assistant',
}

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
