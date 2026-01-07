import { useState, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import {
  fetchTrends,
  fetchPlatformPerformance,
  fetchOptimalTimes,
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  formatNumber,
  formatPercentage,
  getDayName,
  getHourFormat,
} from "@/utils/formatters";

export default function Analytics() {
  const dispatch = useAppDispatch();
  const { trends, platformPerformance, optimalTimes, loading } = useAppSelector(
    (state) => state.analytics
  );

  const [period, setPeriod] = useState(30);
  const [granularity, setGranularity] = useState<"hourly" | "daily" | "weekly">(
    "daily"
  );
  const [metric, setMetric] = useState<"engagement" | "impressions" | "clicks">(
    "engagement"
  );

  useEffect(() => {
    dispatch(fetchTrends({ period, granularity, metric }));
    dispatch(fetchPlatformPerformance());
    dispatch(fetchOptimalTimes());
  }, [dispatch, period, granularity, metric]);

  // Memoize expensive calculations
  const platformChartData = useMemo(() => {
    if (!platformPerformance || platformPerformance.length === 0) return [];
    return platformPerformance.map((p) => ({
      ...p,
      platform: p.platform.charAt(0).toUpperCase() + p.platform.slice(1),
    }));
  }, [platformPerformance]);

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <a href="/dashboard" className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
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
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg text-sm font-medium"
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
                  className="text-primary-600 bg-primary-50 px-3 py-2 rounded-lg text-sm font-medium"
                >
                  Analytics
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Advanced Analytics
          </h2>
          <p className="text-gray-600 mt-1">
            Deep dive into your social media performance
          </p>
        </div>

        {/* Filters */}
        <div className="card mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Time Period</label>
              <select
                value={period}
                onChange={(e) => setPeriod(Number(e.target.value))}
                className="input"
              >
                <option value={7}>Last 7 Days</option>
                <option value={30}>Last 30 Days</option>
                <option value={90}>Last 90 Days</option>
              </select>
            </div>

            <div>
              <label className="label">Granularity</label>
              <select
                value={granularity}
                onChange={(e) =>
                  setGranularity(
                    e.target.value as "hourly" | "daily" | "weekly"
                  )
                }
                className="input"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            <div>
              <label className="label">Metric</label>
              <select
                value={metric}
                onChange={(e) =>
                  setMetric(
                    e.target.value as "engagement" | "impressions" | "clicks"
                  )
                }
                className="input"
              >
                <option value="engagement">Engagement</option>
                <option value="impressions">Impressions</option>
                <option value="clicks">Clicks</option>
              </select>
            </div>
          </div>
        </div>

        {/* Trend Analysis */}
        <div className="card mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Trend Analysis
            </h3>
            {trends && (
              <div className="text-sm text-gray-600">
                Growth:{" "}
                <span
                  className={`font-semibold ${
                    trends.summary.growth >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {trends.summary.growth >= 0 ? "+" : ""}
                  {formatPercentage(trends.summary.growth)}
                </span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="h-96 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : trends && trends.data.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
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
                  strokeWidth={3}
                  name={metric.charAt(0).toUpperCase() + metric.slice(1)}
                  dot={{ r: 5 }}
                />
                {trends.data[0]?.movingAvg !== undefined && (
                  <Line
                    type="monotone"
                    dataKey="movingAvg"
                    stroke="#10B981"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="7-Day Moving Avg"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-96 flex items-center justify-center text-gray-500">
              <p>No trend data available</p>
            </div>
          )}

          {trends && (
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(trends.summary.total)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Average</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(trends.summary.average)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Peak</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(trends.summary.peak.value)}
                </p>
                <p className="text-xs text-gray-500">
                  {trends.summary.peak.date}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Platform Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Platform Engagement Comparison
            </h3>
            {platformChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={platformChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="platform" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="averageEngagementRate"
                    fill="#3B82F6"
                    name="Avg Engagement Rate (%)"
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

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Engagement Distribution
            </h3>
            {platformPerformance && platformPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={platformPerformance.map((p) => ({
                      name: p.platform,
                      value: p.totalEngagement,
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {platformPerformance.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-300px flex items-center justify-center text-gray-500">
                <p>No distribution data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Optimal Times */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recommended Posting Times
          </h3>
          {optimalTimes && optimalTimes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {optimalTimes.slice(0, 6).map((time, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg p-4 border border-primary-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold">
                      #{index + 1}
                    </div>
                    <span className="text-sm font-medium text-primary-600">
                      {formatPercentage(time.confidenceScore * 100)} confidence
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900 text-lg">
                    {getDayName(time.dayOfWeek)}
                  </h4>
                  <p className="text-2xl font-bold text-primary-600">
                    {getHourFormat(time.hour)}
                  </p>
                  <div className="mt-2 pt-2 border-t border-primary-200">
                    <p className="text-sm text-gray-600">
                      Avg Engagement: {formatPercentage(time.averageEngagement)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {time.sampleSize} posts analyzed
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
      </div>
    </div>
  );
}
