import { Router } from 'express';
import {
  getOptimalPostingTimes,
  getEngagementTrends,
  getPlatformPerformance,
  getTopPosts,
  getDashboardOverview,
} from '@/controllers/analyticsController';
import { authenticate } from '@/middleware/auth';

const router = Router();

// All analytics routes require authentication
router.use(authenticate);

router.get('/optimal-times', getOptimalPostingTimes);
router.get('/trends', getEngagementTrends);
router.get('/performance/platforms', getPlatformPerformance);
router.get('/performance/top-posts', getTopPosts);
router.get('/dashboard/overview', getDashboardOverview);

export default router;
