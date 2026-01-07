import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { logout } from "@/store/slices/authSlice";
import {
  fetchDashboardOverview,
  fetchOptimalTimes,
  fetchTrends,
  fetchPlatformPerformance,
} from "@/store/slices/analyticsSlice";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  formatNumber,
  formatPercentage,
  getDayName,
  getHourFormat,
  getPlatformIcon,
} from "@/utils/formatters";

export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const {
    dashboardOverview,
    optimalTimes,
    trends,
    platformPerformance,
    loading,
  } = useAppSelector((state) => state.analytics);

  useEffect(() => {
    dispatch(fetchDashboardOverview());
    dispatch(fetchOptimalTimes());
    dispatch(
      fetchTrends({ period: 7, granularity: "daily", metric: "engagement" })
    );
    dispatch(fetchPlatformPerformance());
  }, [dispatch]);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/login");
  };

  if (loading && !dashboardOverview) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <a href="/dashboard" className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <span className="text-xl font-bold text-gray-900">
                  Social Analytics
                </span>
              </a>
              <div className="hidden md:flex space-x-4">
                <a
                  href="/dashboard"
                  className="text-primary-600 bg-primary-50 px-3 py-2 rounded-lg text-sm font-medium"
                >
                  Dashboard
                </a>
                <a
                  href="/posts"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg text-sm font-medium"
                >
                  Posts
                </a>
                <a
                  href="/analytics"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg text-sm font-medium"
                >
                  Analytics
                </a>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-secondary text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            {user?.role === "admin" && (
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                👑 Admin View - System-Wide Analytics
              </span>
            )}
          </div>
          <p className="text-gray-600 mt-1">
            {user?.role === "admin"
              ? "Overview of all users' performance across the platform"
              : "Overview of your social media performance"}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Total Engagement (30d)
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatNumber(dashboardOverview?.totalEngagement30d || 0)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Engagement (7d)
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatNumber(dashboardOverview?.totalEngagement7d || 0)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-secondary-100 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-secondary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Avg Engagement Rate
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatPercentage(
                    dashboardOverview?.averageEngagementRate || 0
                  )}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Growth Rate</p>
                <p
                  className={`text-3xl font-bold mt-2 ${
                    (dashboardOverview?.growth || 0) >= 0
                      ? "text-secondary-600"
                      : "text-red-600"
                  }`}
                >
                  {(dashboardOverview?.growth || 0) >= 0 ? "+" : ""}
                  {formatPercentage(dashboardOverview?.growth || 0)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Engagement Trend Chart */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Engagement Trend (Last 7 Days)
            </h3>
            {trends && trends.data.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trends.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    name="Engagement"
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="movingAvg"
                    stroke="#10B981"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Moving Avg"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-300px flex items-center justify-center text-gray-500">
                <p>No trend data available</p>
              </div>
            )}
          </div>

          {/* Platform Performance Chart */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Platform Performance
            </h3>
            {platformPerformance && platformPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={platformPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="platform" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="averageEngagementRate"
                    fill="#3B82F6"
                    name="Engagement Rate (%)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-300px flex items-center justify-center text-gray-500">
                <p>No platform data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Optimal Posting Times & Top Posts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Optimal Posting Times */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Optimal Posting Times
            </h3>
            {optimalTimes && optimalTimes.length > 0 ? (
              <div className="space-y-3">
                {optimalTimes.slice(0, 5).map((time, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {getDayName(time.dayOfWeek)} at{" "}
                          {getHourFormat(time.hour)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Avg Engagement:{" "}
                          {formatPercentage(time.averageEngagement)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-primary-600">
                        {formatPercentage(time.confidenceScore * 100)}{" "}
                        confidence
                      </p>
                      <p className="text-xs text-gray-500">
                        {time.sampleSize} posts
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                No optimal time data available
              </p>
            )}
          </div>

          {/* Top Posts */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-secondary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
              Top Performing Posts
            </h3>
            {dashboardOverview?.topPosts &&
            dashboardOverview.topPosts.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {dashboardOverview.topPosts.map((post, index) => (
                  <div
                    key={post._id}
                    className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">
                        {post.content}
                      </p>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-xs text-gray-600">
                          {getPlatformIcon(post.platform)} {post.platform}
                        </span>
                        <span className="text-xs text-gray-600">
                          Rate: {formatPercentage(post.engagementRate)}
                        </span>
                        <span className="text-xs font-medium text-primary-600">
                          Score: {post.performanceScore.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <a
                  href="/posts"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg text-sm font-medium"
                >
                  Posts
                </a>
                <a
                  href="/analytics"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg text-sm font-medium"
                >
                  Analytics
                </a>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                No posts available
              </p>
            )}
          </div>
        </div>

        {/* Best Platform Info */}
        {dashboardOverview?.bestPlatform && (
          <div className="card bg-gradient-to-r from-primary-50 to-secondary-50 border-l-4 border-primary-600">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-2xl">
                  {getPlatformIcon(dashboardOverview.bestPlatform)}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Best Performing Platform
                </h3>
                <p className="text-gray-700 capitalize">
                  <span className="font-bold">
                    {dashboardOverview.bestPlatform}
                  </span>{" "}
                  is driving the most engagement for your content!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
