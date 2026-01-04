export interface NotificationDto {
  id: number;
  userId: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}
