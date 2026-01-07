import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Post } from '@/models/Post';
import { AuthRequest } from '@/types';
import { ForbiddenError, NotFoundError, ValidationError } from '@/utils/errors';

export const createPost = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Authentication required');
    }

    const { content, platform, scheduledAt, status } = req.body;

    const post = await Post.create({
      userId: req.user._id,
      content,
      platform,
      scheduledAt: new Date(scheduledAt),
      status: status || 'draft',
    });

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

export const getPosts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Authentication required');
    }

    const {
      page = '1',
      limit = '20',
      status,
      platform,
      search,
      sort = '-createdAt',
      startDate,
      endDate,
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build query filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};

    // Only show user's own posts unless admin
    if (req.user.role !== 'admin') {
      filter.userId = req.user._id;
    }

    if (status) {
      filter.status = status;
    }

    if (platform) {
      filter.platform = platform;
    }

    if (search) {
      filter.content = { $regex: search, $options: 'i' };
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate as string);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate as string);
      }
    }

    // Execute query with pagination
    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort(sort as string)
        .skip(skip)
        .limit(limitNum)
        .populate('userId', 'name email')
        .lean(),
      Post.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        posts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPost = async (
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

    const post = await Post.findById(id).populate('userId', 'name email');

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    // Check ownership if not admin
    if (req.user.role !== 'admin' && post.userId._id.toString() !== req.user._id) {
      throw new ForbiddenError('Access denied');
    }

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (
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

    const post = await Post.findById(id);

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    // Check ownership if not admin
    if (req.user.role !== 'admin' && post.userId.toString() !== req.user._id) {
      throw new ForbiddenError('Access denied');
    }

    // Prevent editing published posts
    if (post.status === 'published') {
      throw new ValidationError('Cannot edit published posts');
    }

    // Update fields
    const { content, platform, scheduledAt, status } = req.body;

    if (content !== undefined) post.content = content;
    if (platform !== undefined) post.platform = platform;
    if (scheduledAt !== undefined) post.scheduledAt = new Date(scheduledAt);
    if (status !== undefined) post.status = status;

    await post.save();

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (
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

    const post = await Post.findById(id);

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    // Check ownership if not admin
    if (req.user.role !== 'admin' && post.userId.toString() !== req.user._id) {
      throw new ForbiddenError('Access denied');
    }

    // Prevent deleting published posts
    if (post.status === 'published') {
      throw new ValidationError('Cannot delete published posts');
    }

    await Post.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
