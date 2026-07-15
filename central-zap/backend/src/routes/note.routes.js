import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { getNote, upsertNote } from '../controllers/note.controller.js';

const router = Router();
router.use(authMiddleware);
router.get('/:contactId', getNote);
router.post('/:contactId', upsertNote);
export default router;
