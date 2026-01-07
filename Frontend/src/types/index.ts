export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export type Platform = "twitter" | "facebook" | "instagram" | "linkedin";
export type PostStatus = "draft" | "scheduled" | "published" | "failed";

export interface Post {
  _id: string;
  userId: string | User;
  content: string;
  platform: Platform;
  scheduledAt: string;
  publishedAt?: string;
  status: PostStatus;
  metadata: {
    hashtags: string[];
    wordCount: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostData {
  content: string;
  platform: Platform;
  scheduledAt: string;
  status?: "draft" | "scheduled";
}

export interface PostsState {
  posts: Post[];
  currentPost: Post | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    status?: PostStatus;
    platform?: Platform;
    search?: string;
  };
}

export interface OptimalTime {
  dayOfWeek: number;
  hour: number;
  averageEngagement: number;
  confidenceScore: number;
  sampleSize: number;
}

export interface TrendDataPoint {
  date: string;
  value: number;
  movingAvg?: number;
}

export interface TrendsSummary {
  total: number;
  average: number;
  growth: number;
  peak: {
    date: string;
    value: number;
  };
}

export interface EngagementTrends {
  data: TrendDataPoint[];
  summary: TrendsSummary;
}

export interface PlatformPerformance {
  platform: string;
  totalPosts: number;
  totalEngagement: number;
  averageEngagementRate: number;
  averagePerformanceScore: number;
}

export interface PostMetrics {
  totalEngagement: number;
  engagementRate: number;
  clickThroughRate: number;
  averageEngagementPerHour: number;
  performanceScore: number;
}

export interface DashboardOverview {
  totalEngagement30d: number;
  totalEngagement7d: number;
  averageEngagementRate: number;
  bestPlatform: string | null;
  topPosts: (Post & PostMetrics)[];
  growth: number;
}

export interface AnalyticsState {
  optimalTimes: OptimalTime[];
  trends: EngagementTrends | null;
  platformPerformance: PlatformPerformance[];
  topPosts: (Post & PostMetrics)[];
  dashboardOverview: DashboardOverview | null;
  loading: boolean;
  error: string | null;
}
