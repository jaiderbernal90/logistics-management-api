export interface WebSocketMessage {
  tracking_number: string;
  state: string;
  location: string;
  timestamp: Date;
  additional_info?: string;
}

export interface WebSocketService {
  initialize?(server: any): void;
  notifyStatusUpdate(trackingNumber: string, data: WebSocketMessage): void;
  hasActiveListeners?(trackingNumber: string): boolean;
  getStats?(): any;
}
