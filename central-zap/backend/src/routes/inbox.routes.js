import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { getInbox, markRead } from '../controllers/inbox.controller.js';

const router = Router();
router.use(authMiddleware);

router.get('/', getInbox);
router.post('/:contactId/read', markRead);

export default router;
