import mongoose, { Document, Schema } from 'mongoose';
import { Platform, PostStatus } from '@/types';

export interface IPost extends Document {
  userId: mongoose.Types.ObjectId;
  content: string;
  platform: Platform;
  scheduledAt: Date;
  publishedAt?: Date;
  status: PostStatus;
  metadata: {
    hashtags: string[];
    wordCount: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      maxlength: [1000, 'Content cannot exceed 1000 characters'],
      trim: true,
    },
    platform: {
      type: String,
      required: [true, 'Platform is required'],
      enum: ['twitter', 'facebook', 'instagram', 'linkedin'],
      index: true,
    },
    scheduledAt: {
      type: Date,
      required: [true, 'Scheduled date and time is required'],
      index: true,
    },
    publishedAt: {
      type: Date,
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'published', 'failed'],
      default: 'draft',
      index: true,
    },
    metadata: {
      hashtags: {
        type: [String],
        default: [],
      },
      wordCount: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Extract hashtags and word count before saving
postSchema.pre('save', function () {
  // Extract hashtags
  const hashtagRegex = /#[\w]+/g;
  const hashtags = this.content.match(hashtagRegex) || [];
  this.metadata.hashtags = hashtags;

  // Calculate word count
  this.metadata.wordCount = this.content.split(/\s+/).filter((word) => word.length > 0).length;
});

// Compound indexes for optimized queries
postSchema.index({ userId: 1, status: 1, createdAt: -1 });
postSchema.index({ userId: 1, platform: 1 });
postSchema.index({ status: 1, scheduledAt: 1 });
postSchema.index({ status: 1, publishedAt: -1 });

export const Post = mongoose.model<IPost>('Post', postSchema);
