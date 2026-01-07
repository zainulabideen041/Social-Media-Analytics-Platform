import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import {
  fetchPosts,
  createPost,
  deletePost,
  setFilters,
} from "@/store/slices/postsSlice";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreatePostData, PostStatus } from "@/types";
import { formatDate, getPlatformIcon } from "@/utils/formatters";

const postSchema = z.object({
  content: z
    .string()
    .min(1, "Content is required")
    .max(1000, "Max 1000 characters"),
  platform: z.enum(["twitter", "facebook", "instagram", "linkedin"]),
  scheduledAt: z.string(),
  status: z.enum(["draft", "scheduled"]).optional(),
});

type PostFormData = z.infer<typeof postSchema>;

export default function Posts() {
  const dispatch = useAppDispatch();
  const { posts, loading, pagination, filters } = useAppSelector(
    (state) => state.posts
  );
  const { user } = useAppSelector((state) => state.auth);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      status: "draft",
      scheduledAt: new Date().toISOString().slice(0, 16),
    },
  });

  useEffect(() => {
    dispatch(fetchPosts({ ...filters, page: 1 }));
  }, [dispatch, filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setFilters({ ...filters, search: searchTerm }));
  };

  const handleFilterChange = (key: string, value: string) => {
    dispatch(setFilters({ ...filters, [key]: value || undefined }));
  };

  const handleCreatePost = async (data: PostFormData) => {
    await dispatch(createPost(data as CreatePostData));
    setShowCreateModal(false);
    reset();
    dispatch(fetchPosts({ ...filters }));
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      await dispatch(deletePost(id));
    }
  };

  const getStatusColor = (status: PostStatus) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800",
      scheduled: "bg-blue-100 text-blue-800",
      published: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
    };
    return colors[status];
  };

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
                  className="text-primary-600 bg-primary-50 px-3 py-2 rounded-lg text-sm font-medium"
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
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold text-gray-900">
                Posts Management
              </h2>
              {user?.role === "admin" && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  👑 Admin View - Viewing All Users
                </span>
              )}
            </div>
            <p className="text-gray-600 mt-1">
              {user?.role === "admin"
                ? "Manage all posts from all users"
                : "Create, schedule, and manage your social media posts"}
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary flex items-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Post
          </button>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <form onSubmit={handleSearch} className="md:col-span-2">
              <label className="label">Search</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search posts..."
                  className="input flex-1"
                />
                <button type="submit" className="btn btn-primary">
                  Search
                </button>
              </div>
            </form>

            <div>
              <label className="label">Status</label>
              <select
                className="input"
                value={filters.status || ""}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div>
              <label className="label">Platform</label>
              <select
                className="input"
                value={filters.platform || ""}
                onChange={(e) => handleFilterChange("platform", e.target.value)}
              >
                <option value="">All Platforms</option>
                <option value="twitter">Twitter</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="linkedin">LinkedIn</option>
              </select>
            </div>
          </div>
        </div>

        {/* Posts List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500">
              No posts found. Create your first post to get started!
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post._id}
                  className="card hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl">
                          {getPlatformIcon(post.platform)}
                        </span>
                        <span className="font-medium capitalize text-gray-700">
                          {post.platform}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            post.status
                          )}`}
                        >
                          {post.status}
                        </span>
                        {/* Show author for admin */}
                        {user?.role === "admin" && (post as any).userId && (
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                            👤{" "}
                            {typeof (post as any).userId === "object"
                              ? (post as any).userId.name ||
                                (post as any).userId.email
                              : "User"}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-900 mb-2">{post.content}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Scheduled: {formatDate(post.scheduledAt)}</span>
                        {post.publishedAt && (
                          <span>Published: {formatDate(post.publishedAt)}</span>
                        )}
                        {post.metadata.hashtags.length > 0 && (
                          <span className="flex items-center">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                              />
                            </svg>
                            {post.metadata.hashtags.length} hashtags
                          </span>
                        )}
                        <span>{post.metadata.wordCount} words</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {post.status !== "published" && (
                        <button
                          onClick={() => handleDelete(post._id)}
                          className="btn btn-danger text-sm"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center mt-8 space-x-2">
                {Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() => dispatch(fetchPosts({ ...filters, page }))}
                    className={`px-4 py-2 rounded-lg ${
                      pagination.page === page
                        ? "bg-primary-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Create New Post
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    reset();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form
                onSubmit={handleSubmit(handleCreatePost)}
                className="space-y-5"
              >
                <div>
                  <label className="label">Content</label>
                  <textarea
                    {...register("content")}
                    rows={5}
                    className={`input ${errors.content ? "input-error" : ""}`}
                    placeholder="What's on your mind?"
                  />
                  {errors.content && (
                    <p className="error-message">{errors.content.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Platform</label>
                    <select
                      {...register("platform")}
                      className={`input ${
                        errors.platform ? "input-error" : ""
                      }`}
                    >
                      <option value="twitter">🐦 Twitter</option>
                      <option value="facebook">📘 Facebook</option>
                      <option value="instagram">📷 Instagram</option>
                      <option value="linkedin">💼 LinkedIn</option>
                    </select>
                    {errors.platform && (
                      <p className="error-message">{errors.platform.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">Status</label>
                    <select {...register("status")} className="input">
                      <option value="draft">Draft</option>
                      <option value="scheduled">Scheduled</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Schedule Date & Time</label>
                  <input
                    type="datetime-local"
                    {...register("scheduledAt")}
                    className={`input ${
                      errors.scheduledAt ? "input-error" : ""
                    }`}
                  />
                  {errors.scheduledAt && (
                    <p className="error-message">
                      {errors.scheduledAt.message}
                    </p>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <button type="submit" className="btn btn-primary flex-1">
                    Create Post
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      reset();
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
