import mongoose from 'mongoose';
import { Engagement } from '@/models/Engagement';
import { Post } from '@/models/Post';
import { TimeGranularity } from '@/types';

interface PostPerformanceMetrics {
  totalEngagement: number;
  engagementRate: number;
  clickThroughRate: number;
  averageEngagementPerHour: number;
  performanceScore: number;
}

interface OptimalPostingTime {
  dayOfWeek: number;
  hour: number;
  averageEngagement: number;
  confidenceScore: number;
  sampleSize: number;
}

interface TrendDataPoint {
  date: string;
  value: number;
  movingAvg?: number;
}

interface TrendsSummary {
  total: number;
  average: number;
  growth: number;
  peak: {
    date: string;
    value: number;
  };
}

interface PlatformPerformance {
  platform: string;
  totalPosts: number;
  totalEngagement: number;
  averageEngagementRate: number;
  averagePerformanceScore: number;
}

export class AnalyticsService {
  // Calculate post performance metrics
  static async calculatePostMetrics(postId: string): Promise<PostPerformanceMetrics> {
    const post = await Post.findById(postId);

    if (!post || !post.publishedAt) {
      return {
        totalEngagement: 0,
        engagementRate: 0,
        clickThroughRate: 0,
        averageEngagementPerHour: 0,
        performanceScore: 0,
      };
    }

    // Aggregate all engagement data for this post
    const result = await Engagement.aggregate([
      { $match: { postId: new mongoose.Types.ObjectId(postId) } },
      {
        $group: {
          _id: null,
          totalLikes: { $sum: '$metrics.likes' },
          totalComments: { $sum: '$metrics.comments' },
          totalShares: { $sum: '$metrics.shares' },
          totalClicks: { $sum: '$metrics.clicks' },
          totalImpressions: { $sum: '$metrics.impressions' },
        },
      },
    ]);

    if (result.length === 0) {
      return {
        totalEngagement: 0,
        engagementRate: 0,
        clickThroughRate: 0,
        averageEngagementPerHour: 0,
        performanceScore: 0,
      };
    }

    const data = result[0];
    const totalEngagement = data.totalLikes + data.totalComments + data.totalShares;
    const engagementRate =
      data.totalImpressions > 0 ? (totalEngagement / data.totalImpressions) * 100 : 0;
    const clickThroughRate =
      data.totalImpressions > 0 ? (data.totalClicks / data.totalImpressions) * 100 : 0;

    // Calculate hours since publication
    const hoursSincePublished =
      (Date.now() - new Date(post.publishedAt).getTime()) / (1000 * 60 * 60);
    const averageEngagementPerHour =
      hoursSincePublished > 0 ? totalEngagement / hoursSincePublished : 0;

    // Performance score algorithm
    const performanceScore = engagementRate * 0.4 + clickThroughRate * 0.3 + data.totalShares * 0.3;

    return {
      totalEngagement,
      engagementRate: parseFloat(engagementRate.toFixed(2)),
      clickThroughRate: parseFloat(clickThroughRate.toFixed(2)),
      averageEngagementPerHour: parseFloat(averageEngagementPerHour.toFixed(2)),
      performanceScore: parseFloat(performanceScore.toFixed(2)),
    };
  }

  // CRITICAL ALGORITHM: Optimal Posting Time Analysis
  static async calculateOptimalPostingTimes(
    userId?: mongoose.Types.ObjectId
  ): Promise<OptimalPostingTime[]> {
    // Fetch last 30 days of engagement data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const matchStage: any = {
      timestamp: { $gte: thirtyDaysAgo },
    };

    // If userId provided, filter by user; otherwise fetch all (for admin)
    if (userId) {
      matchStage.userId = userId;
    }

    const engagements = await Engagement.aggregate([
      {
        $match: matchStage,
      },
      {
        $group: {
          _id: {
            dayOfWeek: '$dayOfWeek',
            hourOfDay: '$hourOfDay',
          },
          totalEngagement: {
            $sum: {
              $add: ['$metrics.likes', '$metrics.comments', '$metrics.shares'],
            },
          },
          totalImpressions: { $sum: '$metrics.impressions' },
          count: { $sum: 1 },
          timestamps: { $push: '$timestamp' },
        },
      },
    ]);

    if (engagements.length === 0) {
      return [];
    }

    // Calculate engagement rates with exponential decay weighting
    interface TimeSlotData {
      dayOfWeek: number;
      hour: number;
      weightedEngagement: number;
      sampleSize: number;
    }

    const timeSlots: TimeSlotData[] = engagements.map((slot) => {
      const now = Date.now();
      let weightedSum = 0;
      let weightSum = 0;

      // Apply exponential decay: recent data gets 2x weight
      slot.timestamps.forEach((timestamp: Date) => {
        const daysAgo = (now - new Date(timestamp).getTime()) / (1000 * 60 * 60 * 24);
        const weight = Math.exp(-daysAgo / 15); // Weight decays over 15 days
        const recencyMultiplier = daysAgo < 7 ? 2 : 1; // Recent week gets 2x

        const engagementRate =
          slot.totalImpressions > 0 ? slot.totalEngagement / slot.totalImpressions : 0;

        weightedSum += engagementRate * weight * recencyMultiplier;
        weightSum += weight * recencyMultiplier;
      });

      const averageEngagement = weightSum > 0 ? weightedSum / weightSum : 0;

      return {
        dayOfWeek: slot._id.dayOfWeek,
        hour: slot._id.hourOfDay,
        weightedEngagement: averageEngagement * 100, // Convert to percentage
        sampleSize: slot.count,
      };
    });

    // Remove outliers using 3 standard deviations
    const engagementValues = timeSlots.map((slot) => slot.weightedEngagement);
    const mean = engagementValues.reduce((a, b) => a + b, 0) / engagementValues.length;
    const variance =
      engagementValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      engagementValues.length;
    const stdDev = Math.sqrt(variance);
    const threshold = mean + 3 * stdDev;

    const filteredSlots = timeSlots.filter((slot) => slot.weightedEngagement <= threshold);

    if (filteredSlots.length === 0) {
      return [];
    }

    // Calculate max engagement for confidence score
    const maxEngagement = Math.max(...filteredSlots.map((slot) => slot.weightedEngagement));

    // Calculate confidence scores
    const slotsWithConfidence: OptimalPostingTime[] = filteredSlots.map((slot) => {
      // Confidence = min(1, sampleSize/10) * (avgEngagement/maxEngagement)
      const sampleConfidence = Math.min(1, slot.sampleSize / 10);
      const performanceConfidence = maxEngagement > 0 ? slot.weightedEngagement / maxEngagement : 0;
      const confidenceScore = sampleConfidence * performanceConfidence;

      return {
        dayOfWeek: slot.dayOfWeek,
        hour: slot.hour,
        averageEngagement: parseFloat(slot.weightedEngagement.toFixed(2)),
        confidenceScore: parseFloat(confidenceScore.toFixed(2)),
        sampleSize: slot.sampleSize,
      };
    });

    // Sort by weighted engagement and return top 5
    return slotsWithConfidence
      .sort((a, b) => b.averageEngagement - a.averageEngagement)
      .slice(0, 5);
  }

  // Engagement trends aggregation
  static async calculateEngagementTrends(
    userId: mongoose.Types.ObjectId | undefined,
    period: number, // days
    granularity: TimeGranularity,
    metric: 'engagement' | 'impressions' | 'clicks' = 'engagement'
  ): Promise<{ data: TrendDataPoint[]; summary: TrendsSummary }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    // Determine grouping based on granularity
    let groupByFormat: Record<string, unknown>;
    let dateFormat: string;

    switch (granularity) {
      case 'hourly':
        groupByFormat = {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' },
          hour: { $hour: '$timestamp' },
        };
        dateFormat = '%Y-%m-%d %H:00';
        break;
      case 'weekly':
        groupByFormat = {
          year: { $year: '$timestamp' },
          week: { $week: '$timestamp' },
        };
        dateFormat = '%Y-W%V';
        break;
      case 'daily':
      default:
        groupByFormat = {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' },
        };
        dateFormat = '%Y-%m-%d';
        break;
    }

    // Build aggregation based on metric
    const metricExpression =
      metric === 'engagement'
        ? { $add: ['$metrics.likes', '$metrics.comments', '$metrics.shares'] }
        : metric === 'impressions'
          ? '$metrics.impressions'
          : '$metrics.clicks';

    const matchStage: any = {
      timestamp: { $gte: startDate },
    };

    // If userId provided, filter by user; otherwise fetch all (for admin)
    if (userId) {
      matchStage.userId = userId;
    }

    const data = await Engagement.aggregate([
      {
        $match: matchStage,
      },
      {
        $group: {
          _id: groupByFormat,
          value: { $sum: metricExpression },
          timestamp: { $first: '$timestamp' },
        },
      },
      {
        $sort: { timestamp: 1 },
      },
      {
        $project: {
          date: { $dateToString: { format: dateFormat, date: '$timestamp' } },
          value: 1,
        },
      },
    ]);

    if (data.length === 0) {
      return {
        data: [],
        summary: {
          total: 0,
          average: 0,
          growth: 0,
          peak: { date: '', value: 0 },
        },
      };
    }

    // Calculate moving averages (7-point window for simplicity)
    const dataWithMovingAvg: TrendDataPoint[] = data.map((point, index) => {
      const windowStart = Math.max(0, index - 3);
      const windowEnd = Math.min(data.length, index + 4);
      const window = data.slice(windowStart, windowEnd);
      const movingAvg = window.reduce((sum, p) => sum + p.value, 0) / window.length;

      return {
        date: point.date,
        value: point.value,
        movingAvg: parseFloat(movingAvg.toFixed(2)),
      };
    });

    // Calculate summary statistics
    const total = data.reduce((sum, point) => sum + point.value, 0);
    const average = total / data.length;

    // Calculate growth (current period vs previous period)
    const halfPoint = Math.floor(data.length / 2);
    const firstHalfSum = data.slice(0, halfPoint).reduce((sum, p) => sum + p.value, 0);
    const secondHalfSum = data.slice(halfPoint).reduce((sum, p) => sum + p.value, 0);
    const growth = firstHalfSum > 0 ? ((secondHalfSum - firstHalfSum) / firstHalfSum) * 100 : 0;

    // Find peak
    const peak = data.reduce((max, point) => (point.value > max.value ? point : max), data[0]);

    return {
      data: dataWithMovingAvg,
      summary: {
        total,
        average: parseFloat(average.toFixed(2)),
        growth: parseFloat(growth.toFixed(2)),
        peak: {
          date: peak.date,
          value: peak.value,
        },
      },
    };
  }

  // Platform performance comparison
  static async comparePlatformPerformance(
    userId?: mongoose.Types.ObjectId
  ): Promise<PlatformPerformance[]> {
    const matchStage: any = {
      status: 'published',
    };

    // If userId provided, filter by user; otherwise fetch all (for admin)
    if (userId) {
      matchStage.userId = userId;
    }

    const result = await Post.aggregate([
      {
        $match: matchStage,
      },
      {
        $lookup: {
          from: 'engagements',
          localField: '_id',
          foreignField: 'postId',
          as: 'engagements',
        },
      },
      {
        $unwind: {
          path: '$engagements',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: '$platform',
          totalPosts: { $sum: 1 },
          totalEngagement: {
            $sum: {
              $add: [
                '$engagements.metrics.likes',
                '$engagements.metrics.comments',
                '$engagements.metrics.shares',
              ],
            },
          },
          totalImpressions: { $sum: '$engagements.metrics.impressions' },
          totalClicks: { $sum: '$engagements.metrics.clicks' },
          totalShares: { $sum: '$engagements.metrics.shares' },
        },
      },
      {
        $project: {
          platform: '$_id',
          totalPosts: 1,
          totalEngagement: 1,
          averageEngagementRate: {
            $cond: [
              { $gt: ['$totalImpressions', 0] },
              { $multiply: [{ $divide: ['$totalEngagement', '$totalImpressions'] }, 100] },
              0,
            ],
          },
          averagePerformanceScore: {
            $add: [
              {
                $multiply: [
                  {
                    $cond: [
                      { $gt: ['$totalImpressions', 0] },
                      { $multiply: [{ $divide: ['$totalEngagement', '$totalImpressions'] }, 100] },
                      0,
                    ],
                  },
                  0.4,
                ],
              },
              {
                $multiply: [
                  {
                    $cond: [
                      { $gt: ['$totalImpressions', 0] },
                      { $multiply: [{ $divide: ['$totalClicks', '$totalImpressions'] }, 100] },
                      0,
                    ],
                  },
                  0.3,
                ],
              },
              { $multiply: ['$totalShares', 0.3] },
            ],
          },
        },
      },
      {
        $sort: { averageEngagementRate: -1 },
      },
    ]);

    return result.map((item) => ({
      platform: item.platform,
      totalPosts: item.totalPosts,
      totalEngagement: item.totalEngagement,
      averageEngagementRate: parseFloat(item.averageEngagementRate.toFixed(2)),
      averagePerformanceScore: parseFloat(item.averagePerformanceScore.toFixed(2)),
    }));
  }

  // Get top performing posts
  static async getTopPosts(
    userId?: mongoose.Types.ObjectId,
    limit: number = 10
  ): Promise<(Post & PostMetrics)[]> {
    const matchStage: any = {
      status: 'published',
    };

    // If userId provided, filter by user; otherwise fetch all (for admin)
    if (userId) {
      matchStage.userId = userId;
    }

    // Get posts with calculated metrics
    const posts = await Post.find(matchStage).select('content platform publishedAt').lean();

    // Calculate metrics for each post
    const postsWithMetrics = await Promise.all(
      posts.map(async (post) => {
        const metrics = await this.calculatePostMetrics(post._id.toString());
        return {
          ...post,
          ...metrics,
        };
      })
    );

    // Sort by engagement rate and return top N
    return postsWithMetrics.sort((a, b) => b.engagementRate - a.engagementRate).slice(0, limit);
  }
}
