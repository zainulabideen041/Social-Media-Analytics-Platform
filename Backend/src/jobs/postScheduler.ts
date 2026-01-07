import cron from 'node-cron';
import { Post } from '@/models/Post';

// Check for scheduled posts and publish them
export const checkScheduledPosts = async (): Promise<void> => {
  try {
    const now = new Date();

    // Find scheduled posts that should be published
    const postsToPublish = await Post.find({
      status: 'scheduled',
      scheduledAt: { $lte: now },
    });

    if (postsToPublish.length > 0) {
      // Update all posts to published status
      const updatePromises = postsToPublish.map((post) => {
        post.status = 'published';
        post.publishedAt = now;
        return post.save();
      });

      await Promise.all(updatePromises);
      console.log(`✓ Published ${postsToPublish.length} scheduled posts`);
    }
  } catch (error) {
    console.error('Error checking scheduled posts:', error);
  }
};

// Start post scheduler cron job (every minute)
export const startPostScheduler = (): void => {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    await checkScheduledPosts();
  });

  console.log('✓ Post scheduler job started (runs every minute)');
};
