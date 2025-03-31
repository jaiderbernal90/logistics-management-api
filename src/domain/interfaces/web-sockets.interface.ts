
export interface WebSocketOptions {
  cors?: {
    origin: string | string[];
    methods: string[];
    credentials: boolean;
  };
  pingInterval?: number;
  pingTimeout?: number;
}

export interface WebSocketClient {
  id: string;
  subscriptions: string[];
}

export interface WebSocketStats {
  totalConnections: number;
  activeRooms: Record<string, number>;
}
