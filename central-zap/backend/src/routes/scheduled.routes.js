import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import {
  listScheduled,
  createScheduled,
  cancelScheduled,
  deleteScheduled,
} from '../controllers/scheduled.controller.js';

const router = Router();
router.use(authMiddleware);
router.get('/', listScheduled);
router.post('/', createScheduled);
router.post('/:id/cancel', cancelScheduled);
router.delete('/:id', deleteScheduled);
export default router;
