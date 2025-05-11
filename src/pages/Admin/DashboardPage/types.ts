export type NotificationType = 'delay' | 'maintenance' | 'weather';

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  time: string;
} 