import { Router } from 'express';
import {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
} from '@/controllers/postController';
import { authenticate } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import {
  createPostSchema,
  updatePostSchema,
  getPostsQuerySchema,
} from '@/validation/postValidation';

const router = Router();

// All post routes require authentication
router.use(authenticate);

router.get('/', validate(getPostsQuerySchema), getPosts);
router.post('/', validate(createPostSchema), createPost);
router.get('/:id', getPost);
router.put('/:id', validate(updatePostSchema), updatePost);
router.delete('/:id', deletePost);

export default router;
