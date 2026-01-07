import { Router } from 'express';
import { getPostAnalytics } from '@/controllers/analyticsController';
import { authenticate } from '@/middleware/auth';

const router = Router();

// Post-specific analytics route
router.get('/:id/analytics', authenticate, getPostAnalytics);

export default router;
