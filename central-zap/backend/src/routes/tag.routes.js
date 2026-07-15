import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import {
  listTags,
  createTag,
  deleteTag,
  assignTag,
  unassignTag,
} from '../controllers/tag.controller.js';

const router = Router();
router.use(authMiddleware);

router.get('/', listTags);
router.post('/', createTag);
router.delete('/:id', deleteTag);
router.post('/assign/:contactId/:tagId', assignTag);
router.delete('/assign/:contactId/:tagId', unassignTag);

export default router;
