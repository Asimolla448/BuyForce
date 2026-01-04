import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  onModuleInit() {
    this.client = new Redis({
      host: process.env.REDIS_HOST ?? '127.0.0.1',
      port: Number(process.env.REDIS_PORT ?? 6379),
    });

    this.client.on('connect', () => {
      console.log('Redis connected');
    });

    this.client.on('error', (err) => {
      console.error('Redis error:', err.message);
    });
  }

  onModuleDestroy() {
    this.client.quit();
  }

  getClient(): Redis {
    return this.client;
  }

  async set<T extends object | string>(key: string, value: T, expireSeconds?: number): Promise<void> {
    try {
      const val = typeof value === 'string' ? value : JSON.stringify(value);
      if (expireSeconds) {
        await this.client.set(key, val, 'EX', expireSeconds);
      } else {
        await this.client.set(key, val);
      }
    } catch (err) {
      console.error('Redis set error:', err);
    }
  }

  async get<T extends object | string = string>(key: string): Promise<T | null> {
    try {
      const data = await this.client.get(key);
      if (!data) return null;

      try {
        return JSON.parse(data) as T;
      } catch {
        return data as T;
      }
    } catch (err) {
      console.error('Redis get error:', err);
      return null;
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (err) {
      console.error('Redis del error:', err);
    }
  }
}
