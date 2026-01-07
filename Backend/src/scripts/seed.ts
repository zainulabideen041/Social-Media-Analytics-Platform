import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Post } from '../models/Post';
import { Engagement } from '../models/Engagement';

dotenv.config();

const platforms = ['twitter', 'facebook', 'instagram', 'linkedin'] as const;

const generateRandomDate = (daysAgo: number): Date => {
  const now = new Date();
  const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  // Add random hours
  date.setHours(Math.floor(Math.random() * 24));
  date.setMinutes(Math.floor(Math.random() * 60));
  return date;
};

const generatePostContent = (): string => {
  const topics = [
    'Excited to share our latest product update! 🚀',
    'Just finished an amazing team meeting. Great ideas all around! 💡',
    'Looking forward to the weekend! What are your plans? 🎉',
    'Check out our new blog post about social media strategies 📝',
    "Happy Monday everyone! Let's make this week count! 💪",
    'Throwback to our team offsite last month 📸',
    'New partnership announcement coming soon! Stay tuned 👀',
    'Customer success story: How we helped increase engagement by 300% 📊',
    'Tips for better content creation in 2024 ✨',
    'Behind the scenes of our latest campaign 🎬',
  ];

  return topics[Math.floor(Math.random() * topics.length)];
};

const random = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const seedDatabase = async (): Promise<void> => {
  try {
    // Connect to database
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/social-media-analytics';
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB');

    // Clear existing data
    await Promise.all([User.deleteMany({}), Post.deleteMany({}), Engagement.deleteMany({})]);
    console.log('✓ Cleared existing data');

    // Create users
    const adminUser = await User.create({
      email: 'admin@example.com',
      password: 'admin123',
      name: 'Admin User',
      role: 'admin',
    });

    const regularUser = await User.create({
      email: 'user@example.com',
      password: 'user123',
      name: 'Regular User',
      role: 'user',
    });

    console.log('✓ Created 2 users (admin@example.com / admin123, user@example.com / user123)');

    // Create published posts (30 days of data)
    const posts = [];
    const numberOfPosts = 60; // 60 posts

    for (let i = 0; i < numberOfPosts; i++) {
      const daysAgo = Math.floor((i / numberOfPosts) * 30); // Distribute over 30 days
      const publishedAt = generateRandomDate(daysAgo);
      const scheduledAt = new Date(publishedAt.getTime() - 60000); // Scheduled 1 min before publish

      const post = await Post.create({
        userId: i % 2 === 0 ? regularUser._id : adminUser._id,
        content: generatePostContent(),
        platform: platforms[Math.floor(Math.random() * platforms.length)],
        scheduledAt,
        publishedAt,
        status: 'published',
      });

      posts.push(post);
    }

    console.log(`✓ Created ${posts.length} published posts`);

    // Create engagement records (realistic distribution)
    const engagementRecords = [];
    const engagementsPerPost = Math.ceil(6000 / posts.length); // ~100 per post

    for (const post of posts) {
      const postPublishedAt = new Date(post.publishedAt!);
      const postAgeDays = (Date.now() - postPublishedAt.getTime()) / (1000 * 60 * 60 * 24);

      for (let i = 0; i < engagementsPerPost; i++) {
        // Generate engagement timestamp within post age
        const hoursAfterPublish = Math.random() * Math.min(postAgeDays * 24, 168); // Max 7 days
        const engagementTime = new Date(
          postPublishedAt.getTime() + hoursAfterPublish * 60 * 60 * 1000
        );

        const hourOfDay = engagementTime.getHours();
        const dayOfWeek = engagementTime.getDay();

        // Time-based multiplier
        let multiplier = 1.0;
        if (hourOfDay >= 9 && hourOfDay <= 17) multiplier *= 1.5; // Peak hours
        if (dayOfWeek === 0 || dayOfWeek === 6) multiplier *= 0.7; // Weekends
        const ageFactor = Math.max(0.2, Math.exp(-postAgeDays / 7)); // Decay over week
        multiplier *= ageFactor;

        engagementRecords.push({
          postId: post._id,
          userId: post.userId,
          timestamp: engagementTime,
          platform: post.platform,
          metrics: {
            likes: Math.round(random(0, 50) * multiplier),
            comments: Math.round(random(0, 20) * multiplier),
            shares: Math.round(random(0, 15) * multiplier),
            clicks: Math.round(random(0, 100) * multiplier),
            impressions: Math.round(random(100, 1000) * multiplier),
          },
          hourOfDay,
          dayOfWeek,
        });
      }
    }

    await Engagement.insertMany(engagementRecords);
    console.log(`✓ Created ${engagementRecords.length} engagement records`);

    // Create some draft and scheduled posts
    await Post.create({
      userId: regularUser._id,
      content: "This is a draft post that hasn't been published yet",
      platform: 'twitter',
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      status: 'draft',
    });

    await Post.create({
      userId: regularUser._id,
      content: 'This post is scheduled for tomorrow',
      platform: 'facebook',
      scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      status: 'scheduled',
    });

    console.log('✓ Created draft and scheduled posts');

    console.log('\n========== SEEDING COMPLETE ==========');
    console.log('Demo Credentials:');
    console.log('  Admin: admin@example.com / admin123');
    console.log('  User:  user@example.com / user123');
    console.log('\nDatabase Statistics:');
    console.log(`  Users: ${await User.countDocuments()}`);
    console.log(`  Posts: ${await Post.countDocuments()}`);
    console.log(`  Engagements: ${await Engagement.countDocuments()}`);
    console.log('=====================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
