import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import {
  listReminders,
  createReminder,
  completeReminder,
  snoozeReminder,
  deleteReminder,
} from '../controllers/reminder.controller.js';

const router = Router();
router.use(authMiddleware);
router.get('/', listReminders);
router.post('/', createReminder);
router.post('/:id/complete', completeReminder);
router.post('/:id/snooze', snoozeReminder);
router.delete('/:id', deleteReminder);
export default router;
