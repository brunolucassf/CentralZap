import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import {
  listAccounts,
  createAccount,
  connect,
  disconnect,
  removeAccount,
  toggleDnd,
} from '../controllers/account.controller.js';

const router = Router();
router.use(authMiddleware);

router.get('/', listAccounts);
router.post('/', createAccount);
router.post('/:id/connect', connect);
router.post('/:id/disconnect', disconnect);
router.delete('/:id', removeAccount);
router.post('/:id/dnd', toggleDnd);

export default router;
