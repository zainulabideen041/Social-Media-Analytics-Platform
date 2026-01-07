import mongoose from 'mongoose';
import { AnalyticsCache } from '@/models/AnalyticsCache';

export class CacheService {
  // Generate cache key from userId and identifier
  static generateKey(userId: string, identifier: string): string {
    return `${userId}:${identifier}`;
  }

  // Get cached data
  static async get<T>(userId: string, identifier: string): Promise<T | null> {
    try {
      const cacheKey = this.generateKey(userId, identifier);
      const cached = await AnalyticsCache.findOne({
        cacheKey,
        expiresAt: { $gt: new Date() },
      });

      if (cached) {
        return cached.data as T;
      }

      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  // Set data in cache with TTL (in seconds)
  static async set(
    userId: string,
    identifier: string,
    data: unknown,
    ttlSeconds: number
  ): Promise<void> {
    try {
      const cacheKey = this.generateKey(userId, identifier);
      const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

      await AnalyticsCache.findOneAndUpdate(
        { cacheKey },
        {
          userId: new mongoose.Types.ObjectId(userId),
          data,
          expiresAt,
        },
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  // Invalidate cache by pattern
  static async invalidate(userId: string, pattern?: string): Promise<void> {
    try {
      const query: { cacheKey: string | { $regex: string } } = {
        cacheKey: pattern ? { $regex: `^${userId}:${pattern}` } : { $regex: `^${userId}:` },
      };

      await AnalyticsCache.deleteMany(query);
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }

  // Clear all user cache
  static async clearUserCache(userId: string): Promise<void> {
    try {
      await AnalyticsCache.deleteMany({
        userId: new mongoose.Types.ObjectId(userId),
      });
    } catch (error) {
      console.error('Clear user cache error:', error);
    }
  }
}
