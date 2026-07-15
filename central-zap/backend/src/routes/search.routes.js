import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { globalSearch } from '../controllers/search.controller.js';

const router = Router();
router.use(authMiddleware);
router.get('/', globalSearch);
export default router;
