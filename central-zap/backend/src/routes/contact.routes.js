import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { listContacts, createContact, deleteContact } from '../controllers/contact.controller.js';

const router = Router();
router.use(authMiddleware);
router.get('/', listContacts);
router.post('/', createContact);
router.delete('/:id', deleteContact);
export default router;
