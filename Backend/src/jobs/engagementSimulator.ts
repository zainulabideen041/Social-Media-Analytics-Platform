import cron from 'node-cron';
import { Post } from '@/models/Post';
import { Engagement } from '@/models/Engagement';

// Helper function to generate random number in range
const random = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Calculate engagement multiplier based on time and post age
const getEngagementMultiplier = (
  hourOfDay: number,
  dayOfWeek: number,
  postAgeHours: number
): number => {
  let multiplier = 1.0;

  // Peak hours (9am-5pm) get 1.5x multiplier
  if (hourOfDay >= 9 && hourOfDay <= 17) {
    multiplier *= 1.5;
  }

  // Weekends (Saturday=6, Sunday=0) get 0.7x multiplier
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    multiplier *= 0.7;
  }

  // Newer posts get more engagement (exponential decay)
  // Posts lose engagement over time: 1.0 at 0 hours, 0.2 at 72 hours
  const ageFactor = Math.max(0.2, Math.exp(-postAgeHours / 48));
  multiplier *= ageFactor;

  return multiplier;
};

// Generate engagement for all published posts
export const generateEngagement = async (): Promise<void> => {
  try {
    const now = new Date();
    const hourOfDay = now.getHours();
    const dayOfWeek = now.getDay();

    // Find all published posts
    const publishedPosts = await Post.find({
      status: 'published',
      publishedAt: { $exists: true },
    }).select('_id userId platform publishedAt');

    if (publishedPosts.length === 0) {
      return; // No published posts to generate engagement for
    }

    const engagementRecords = [];

    for (const post of publishedPosts) {
      // Calculate post age in hours
      const postAge = now.getTime() - new Date(post.publishedAt!).getTime();
      const postAgeHours = postAge / (1000 * 60 * 60);

      // Only generate engagement for posts less than 7 days old
      if (postAgeHours > 168) {
        continue;
      }

      // Get multiplier based on time and post age
      const multiplier = getEngagementMultiplier(hourOfDay, dayOfWeek, postAgeHours);

      // Generate random metrics with multiplier applied
      const likes = Math.round(random(0, 50) * multiplier);
      const comments = Math.round(random(0, 20) * multiplier);
      const shares = Math.round(random(0, 15) * multiplier);
      const clicks = Math.round(random(0, 100) * multiplier);
      const impressions = Math.round(random(100, 1000) * multiplier);

      engagementRecords.push({
        postId: post._id,
        userId: post.userId,
        timestamp: now,
        platform: post.platform,
        metrics: {
          likes,
          comments,
          shares,
          clicks,
          impressions,
        },
        hourOfDay,
        dayOfWeek,
      });
    }

    if (engagementRecords.length > 0) {
      await Engagement.insertMany(engagementRecords);
      console.log(`✓ Generated engagement for ${engagementRecords.length} posts`);
    }
  } catch (error) {
    console.error('Error generating engagement:', error);
  }
};

// Start engagement simulation cron job (every 30 seconds)
export const startEngagementSimulation = (): void => {
  // Run every 30 seconds
  cron.schedule('*/30 * * * * *', async () => {
    await generateEngagement();
  });

  console.log('✓ Engagement simulation job started (runs every 30 seconds)');
};
