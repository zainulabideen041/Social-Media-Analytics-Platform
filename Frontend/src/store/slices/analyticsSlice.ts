import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AnalyticsState } from "@/types";
import { analyticsService } from "@/services/analyticsService";

const initialState: AnalyticsState = {
  optimalTimes: [],
  trends: null,
  platformPerformance: [],
  topPosts: [],
  dashboardOverview: null,
  loading: false,
  error: null,
};

export const fetchOptimalTimes = createAsyncThunk(
  "analytics/fetchOptimalTimes",
  async (_, { rejectWithValue }) => {
    try {
      return await analyticsService.getOptimalTimes();
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch optimal times"
      );
    }
  }
);

export const fetchTrends = createAsyncThunk(
  "analytics/fetchTrends",
  async (
    params: {
      period?: number;
      granularity?: "hourly" | "daily" | "weekly";
      metric?: "engagement" | "impressions" | "clicks";
    },
    { rejectWithValue }
  ) => {
    try {
      return await analyticsService.getTrends(params);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch trends"
      );
    }
  }
);

export const fetchPlatformPerformance = createAsyncThunk(
  "analytics/fetchPlatformPerformance",
  async (_, { rejectWithValue }) => {
    try {
      return await analyticsService.getPlatformPerformance();
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch platform performance"
      );
    }
  }
);

export const fetchTopPosts = createAsyncThunk(
  "analytics/fetchTopPosts",
  async (limit: number = 10, { rejectWithValue }) => {
    try {
      return await analyticsService.getTopPosts(limit);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch top posts"
      );
    }
  }
);

export const fetchDashboardOverview = createAsyncThunk(
  "analytics/fetchDashboardOverview",
  async (_, { rejectWithValue }) => {
    try {
      return await analyticsService.getDashboardOverview();
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch dashboard"
      );
    }
  }
);

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Optimal times
    builder.addCase(fetchOptimalTimes.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchOptimalTimes.fulfilled, (state, action) => {
      state.loading = false;
      state.optimalTimes = action.payload;
    });
    builder.addCase(fetchOptimalTimes.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Trends
    builder.addCase(fetchTrends.fulfilled, (state, action) => {
      state.trends = action.payload;
    });

    // Platform performance
    builder.addCase(fetchPlatformPerformance.fulfilled, (state, action) => {
      state.platformPerformance = action.payload;
    });

    // Top posts
    builder.addCase(fetchTopPosts.fulfilled, (state, action) => {
      state.topPosts = action.payload;
    });

    // Dashboard overview
    builder.addCase(fetchDashboardOverview.fulfilled, (state, action) => {
      state.dashboardOverview = action.payload;
    });
  },
});

export const { clearError } = analyticsSlice.actions;
export default analyticsSlice.reducer;
