export interface Message {
  id: string;
  content: string;
  timestamp: string;
}

export interface WebSocketMessage {
  type: 'new_message' | 'heartbeat';
  data: Message;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}