import { z } from 'zod';

export const createPostSchema = z.object({
  body: z.object({
    content: z
      .string()
      .min(1, 'Content is required')
      .max(1000, 'Content cannot exceed 1000 characters'),
    platform: z.enum(['twitter', 'facebook', 'instagram', 'linkedin'], {
      message: 'Invalid platform',
    }),
    scheduledAt: z.string().datetime('Invalid date format'),
    status: z.enum(['draft', 'scheduled']).optional().default('draft'),
  }),
});

export const updatePostSchema = z.object({
  body: z.object({
    content: z
      .string()
      .min(1, 'Content is required')
      .max(1000, 'Content cannot exceed 1000 characters')
      .optional(),
    platform: z.enum(['twitter', 'facebook', 'instagram', 'linkedin']).optional(),
    scheduledAt: z.string().datetime('Invalid date format').optional(),
    status: z.enum(['draft', 'scheduled']).optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Post ID is required'),
  }),
});

export const getPostsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('20'),
    status: z.enum(['draft', 'scheduled', 'published', 'failed']).optional(),
    platform: z.enum(['twitter', 'facebook', 'instagram', 'linkedin']).optional(),
    search: z.string().optional(),
    sort: z.string().optional().default('-createdAt'),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
});
