import mongoose, { Document, Schema } from 'mongoose';

export interface IAnalyticsCache extends Document {
  cacheKey: string;
  userId: mongoose.Types.ObjectId;
  data: unknown;
  expiresAt: Date;
  createdAt: Date;
}

const analyticsCacheSchema = new Schema<IAnalyticsCache>(
  {
    cacheKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// TTL index - automatically delete expired cache entries
analyticsCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const AnalyticsCache = mongoose.model<IAnalyticsCache>(
  'AnalyticsCache',
  analyticsCacheSchema
);
