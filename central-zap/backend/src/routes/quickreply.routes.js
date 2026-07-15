import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import {
  listQuickReplies,
  createQuickReply,
  deleteQuickReply,
} from '../controllers/quickreply.controller.js';

const router = Router();
router.use(authMiddleware);
router.get('/', listQuickReplies);
router.post('/', createQuickReply);
router.delete('/:id', deleteQuickReply);
export default router;
