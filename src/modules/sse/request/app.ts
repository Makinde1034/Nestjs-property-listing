export interface EventPayload {
  userId: string;
  data: any;
}

export interface MessageEvent {
  data: any;
  id?: string;
  type?: string;
  retry?: number;
}
