import mongoose, { Document, Schema } from "mongoose";
import { Platform } from "@/types";

export interface IEngagement extends Document {
  postId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  timestamp: Date;
  platform: Platform;
  metrics: {
    likes: number;
    comments: number;
    shares: number;
    clicks: number;
    impressions: number;
  };
  hourOfDay: number; // 0-23
  dayOfWeek: number; // 0-6 (Sunday = 0)
  createdAt: Date;
}

const engagementSchema = new Schema<IEngagement>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      required: true,
      index: true,
    },
    platform: {
      type: String,
      required: true,
      enum: ["twitter", "facebook", "instagram", "linkedin"],
    },
    metrics: {
      likes: {
        type: Number,
        default: 0,
        min: 0,
      },
      comments: {
        type: Number,
        default: 0,
        min: 0,
      },
      shares: {
        type: Number,
        default: 0,
        min: 0,
      },
      clicks: {
        type: Number,
        default: 0,
        min: 0,
      },
      impressions: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    hourOfDay: {
      type: Number,
      required: true,
      min: 0,
      max: 23,
      index: true,
    },
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

// Compound indexes for analytics queries
engagementSchema.index({ postId: 1, timestamp: -1 });
engagementSchema.index({ userId: 1, timestamp: -1 });
engagementSchema.index({ userId: 1, dayOfWeek: 1, hourOfDay: 1 });

// TTL index - automatically delete documents after 90 days
engagementSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

export const Engagement = mongoose.model<IEngagement>(
  "Engagement",
  engagementSchema,
);
