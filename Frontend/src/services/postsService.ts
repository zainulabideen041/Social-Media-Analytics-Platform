import api from "./api";
import { Post, CreatePostData } from "@/types";

interface PostsResponse {
  success: boolean;
  data: {
    posts: Post[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

interface SinglePostResponse {
  success: boolean;
  data: Post;
}

export const postsService = {
  async getPosts(params?: {
    page?: number;
    limit?: number;
    status?: string;
    platform?: string;
    search?: string;
    sort?: string;
  }): Promise<PostsResponse> {
    const response = await api.get<PostsResponse>("/posts", { params });
    return response.data;
  },

  async getPost(id: string): Promise<SinglePostResponse> {
    const response = await api.get<SinglePostResponse>(`/posts/${id}`);
    return response.data;
  },

  async createPost(data: CreatePostData): Promise<SinglePostResponse> {
    const response = await api.post<SinglePostResponse>("/posts", data);
    return response.data;
  },

  async updatePost(
    id: string,
    data: Partial<CreatePostData>
  ): Promise<SinglePostResponse> {
    const response = await api.put<SinglePostResponse>(`/posts/${id}`, data);
    return response.data;
  },

  async deletePost(id: string): Promise<void> {
    await api.delete(`/posts/${id}`);
  },
};
