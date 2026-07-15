import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { getChat, sendMessage } from '../controllers/chat.controller.js';

const router = Router();
router.use(authMiddleware);

router.get('/:contactId', getChat);
router.post('/:contactId/send', sendMessage);

export default router;
