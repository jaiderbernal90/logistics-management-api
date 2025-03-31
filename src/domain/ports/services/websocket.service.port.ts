export interface WebSocketMessage {
  trackingNumber: string;
  status: string;
  location: string;
  created_at: Date;
  additional_info?: string;
}

export interface WebSocketService {
  initialize?(server: any): void;
  notifyStatusUpdate(trackingNumber: string, data: WebSocketMessage): void;
  hasActiveListeners?(trackingNumber: string): boolean;
  getStats?(): any;
}
