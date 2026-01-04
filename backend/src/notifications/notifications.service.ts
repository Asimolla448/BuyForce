import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { Notification } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async create(userId: number, title: string, message: string): Promise<Notification> {
    try {
      const notification = await this.prisma.prisma.notification.create({
        data: { userId, title, message },
      });

      await this.redis.del(`user:${userId}:notifications`);
      await this.redis.del('notifications:all');

      return notification;
    } catch (err) {
      console.error('Failed to create notification', err);
      throw new InternalServerErrorException('Failed to create notification');
    }
  }

  async findAllForUser(userId: number): Promise<Notification[]> {
    const cacheKey = `user:${userId}:notifications`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed as Notification[];
      } catch {}
    }

    try {
      const notifications = await this.prisma.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      await this.redis.set(cacheKey, JSON.stringify(notifications), 60);
      return notifications;
    } catch (err) {
      console.error('Failed to fetch notifications for user', err);
      throw new InternalServerErrorException(
        'Failed to fetch notifications for user',
      );
    }
  }

  async markAsRead(notificationId: number, userId: number): Promise<{ count: number }> {
    try {
      const result = await this.prisma.prisma.notification.updateMany({
        where: { id: notificationId, userId },
        data: { isRead: true },
      });

      await this.redis.del(`user:${userId}:notifications`);
      await this.redis.del('notifications:all');

      return { count: result.count };
    } catch (err) {
      console.error('Failed to mark notification as read', err);
      throw new InternalServerErrorException(
        'Failed to mark notification as read',
      );
    }
  }

  async findAll(): Promise<Notification[]> {
    const cacheKey = 'notifications:all';
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed as Notification[];
      } catch {}
    }

    try {
      const notifications = await this.prisma.prisma.notification.findMany({
        orderBy: { createdAt: 'desc' },
      });

      await this.redis.set(cacheKey, JSON.stringify(notifications), 60);
      return notifications;
    } catch (err) {
      console.error('Failed to fetch notifications for admin', err);
      throw new InternalServerErrorException(
        'Failed to fetch notifications for admin',
      );
    }
  }
}
