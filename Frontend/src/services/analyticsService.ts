import api from "./api";
import {
  OptimalTime,
  EngagementTrends,
  PlatformPerformance,
  PostMetrics,
  Post,
  DashboardOverview,
} from "@/types";

export const analyticsService = {
  async getOptimalTimes(): Promise<OptimalTime[]> {
    const response = await api.get("/analytics/optimal-times");
    return response.data.data;
  },

  async getTrends(params: {
    period?: number;
    granularity?: "hourly" | "daily" | "weekly";
    metric?: "engagement" | "impressions" | "clicks";
  }): Promise<EngagementTrends> {
    const response = await api.get("/analytics/trends", { params });
    return response.data.data;
  },

  async getPlatformPerformance(): Promise<PlatformPerformance[]> {
    const response = await api.get("/analytics/performance/platforms");
    return response.data.data;
  },

  async getTopPosts(limit: number = 10): Promise<(Post & PostMetrics)[]> {
    const response = await api.get("/analytics/performance/top-posts", {
      params: { limit },
    });
    return response.data.data;
  },

  async getPostAnalytics(postId: string): Promise<PostMetrics> {
    const response = await api.get(`/posts/${postId}/analytics`);
    return response.data.data;
  },

  async getDashboardOverview(): Promise<DashboardOverview> {
    const response = await api.get("/analytics/dashboard/overview");
    return response.data.data;
  },
};
