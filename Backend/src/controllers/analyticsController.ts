import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '@/types';
import { AnalyticsService } from '@/services/analyticsService';
import { CacheService } from '@/services/cacheService';
import { ForbiddenError, ValidationError } from '@/utils/errors';

// Get optimal posting times
export const getOptimalPostingTimes = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Authentication required');
    }

    // Admin sees all users' data, regular users see only their own
    const userId =
      req.user.role === 'admin' ? undefined : new mongoose.Types.ObjectId(req.user._id);
    const cacheKey = userId ? `optimal-times:${userId}` : 'optimal-times:all';

    // Check cache first (1 hour TTL)
    const cached = await CacheService.get<unknown>(req.user._id, cacheKey);
    if (cached) {
      res.status(200).json({
        success: true,
        data: cached,
        cached: true,
      });
      return;
    }

    // Calculate optimal times
    const optimalTimes = await AnalyticsService.calculateOptimalPostingTimes(userId);

    // Cache result for 1 hour
    await CacheService.set(req.user._id, cacheKey, optimalTimes, 3600);

    res.status(200).json({
      success: true,
      data: optimalTimes,
      cached: false,
    });
  } catch (error) {
    next(error);
  }
};

// Get engagement trends
export const getEngagementTrends = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Authentication required');
    }

    // Admin sees all users' data, regular users see only their own
    const userId =
      req.user.role === 'admin' ? undefined : new mongoose.Types.ObjectId(req.user._id);
    const { period = '30', granularity = 'daily', metric = 'engagement' } = req.query;

    // Validate inputs
    const periodDays = parseInt(period as string, 10);
    if (isNaN(periodDays) || periodDays < 1 || periodDays > 90) {
      throw new ValidationError('Period must be between 1 and 90 days');
    }

    if (!['hourly', 'daily', 'weekly'].includes(granularity as string)) {
      throw new ValidationError('Granularity must be hourly, daily, or weekly');
    }

    if (!['engagement', 'impressions', 'clicks'].includes(metric as string)) {
      throw new ValidationError('Metric must be engagement, impressions, or clicks');
    }

    // Check cache (15 minutes TTL)
    const cacheKey = `trends:${period}:${granularity}:${metric}:${userId || 'all'}`;
    const cached = await CacheService.get<unknown>(req.user._id, cacheKey);
    if (cached) {
      res.status(200).json({
        success: true,
        data: cached,
        cached: true,
      });
      return;
    }

    // Calculate trends
    const trends = await AnalyticsService.calculateEngagementTrends(
      userId,
      periodDays,
      granularity as 'hourly' | 'daily' | 'weekly',
      metric as 'engagement' | 'impressions' | 'clicks'
    );

    // Cache for 15 minutes
    await CacheService.set(req.user._id, cacheKey, trends, 900);

    res.status(200).json({
      success: true,
      data: trends,
      cached: false,
    });
  } catch (error) {
    next(error);
  }
};

// Get platform performance comparison
export const getPlatformPerformance = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Authentication required');
    }

    // Admin sees all users' data, regular users see only their own
    const userId =
      req.user.role === 'admin' ? undefined : new mongoose.Types.ObjectId(req.user._id);
    const cacheKey = userId ? `platform-performance:${userId}` : 'platform-performance:all';

    // Check cache (15 minutes TTL)
    const cached = await CacheService.get<unknown>(req.user._id, cacheKey);
    if (cached) {
      res.status(200).json({
        success: true,
        data: cached,
        cached: true,
      });
      return;
    }

    // Calculate platform performance
    const platformPerformance = await AnalyticsService.comparePlatformPerformance(userId);

    // Cache for 15 minutes
    await CacheService.set(req.user._id, cacheKey, platformPerformance, 900);

    res.status(200).json({
      success: true,
      data: platformPerformance,
      cached: false,
    });
  } catch (error) {
    next(error);
  }
};

// Get top performing posts
export const getTopPosts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Authentication required');
    }

    // Admin sees all users' posts, regular users see only their own
    const userId =
      req.user.role === 'admin' ? undefined : new mongoose.Types.ObjectId(req.user._id);
    const limit = parseInt(req.query.limit as string, 10) || 10;

    if (limit < 1 || limit > 50) {
      throw new ValidationError('Limit must be between 1 and 50');
    }

    // Check cache (15 minutes TTL)
    const cacheKey = `top-posts:${limit}:${userId || 'all'}`;
    const cached = await CacheService.get<unknown>(req.user._id, cacheKey);
    if (cached) {
      res.status(200).json({
        success: true,
        data: cached,
        cached: true,
      });
      return;
    }

    // Get top posts
    const topPosts = await AnalyticsService.getTopPosts(userId, limit);

    // Cache for 15 minutes
    await CacheService.set(req.user._id, cacheKey, topPosts, 900);

    res.status(200).json({
      success: true,
      data: topPosts,
      cached: false,
    });
  } catch (error) {
    next(error);
  }
};

// Get post-specific analytics
export const getPostAnalytics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Authentication required');
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ValidationError('Invalid post ID');
    }

    // Calculate metrics for the post
    const metrics = await AnalyticsService.calculatePostMetrics(id);

    res.status(200).json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    next(error);
  }
};

// Get dashboard overview
export const getDashboardOverview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Authentication required');
    }

    // Admin sees all users' data, regular users see only their own
    const userId =
      req.user.role === 'admin' ? undefined : new mongoose.Types.ObjectId(req.user._id);
    const cacheKey = userId ? `dashboard-overview:${userId}` : 'dashboard-overview:all';

    // Check cache (5 minutes TTL)
    const cached = await CacheService.get<unknown>(req.user._id, cacheKey);
    if (cached) {
      res.status(200).json({
        success: true,
        data: cached,
        cached: true,
      });
      return;
    }

    // Fetch all data in parallel
    const [platformPerformance, topPosts, trends30d, trends7d] = await Promise.all([
      AnalyticsService.comparePlatformPerformance(userId),
      AnalyticsService.getTopPosts(userId, 5),
      AnalyticsService.calculateEngagementTrends(userId, 30, 'daily'),
      AnalyticsService.calculateEngagementTrends(userId, 7, 'daily'),
    ]);

    // Find best performing platform
    const bestPlatform =
      platformPerformance.length > 0
        ? platformPerformance.reduce((best, current) =>
            current.averageEngagementRate > best.averageEngagementRate ? current : best
          )
        : null;

    const overview = {
      totalEngagement30d: trends30d.summary.total,
      totalEngagement7d: trends7d.summary.total,
      averageEngagementRate:
        platformPerformance.reduce((sum, p) => sum + p.averageEngagementRate, 0) /
          platformPerformance.length || 0,
      bestPlatform: bestPlatform?.platform || null,
      topPosts: topPosts.slice(0, 5),
      growth: trends30d.summary.growth,
    };

    // Cache for 5 minutes
    await CacheService.set(req.user._id, cacheKey, overview, 300);

    res.status(200).json({
      success: true,
      data: overview,
      cached: false,
    });
  } catch (error) {
    next(error);
  }
};
