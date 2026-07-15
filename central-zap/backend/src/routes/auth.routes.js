import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { z } from 'zod';
import { register, login, me } from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', validateBody(
  z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
  })
), register);

router.post('/login', validateBody(
  z.object({
    email: z.string().email(),
    password: z.string().min(1),
  })
), login);

router.get('/me', authMiddleware, me);

export default router;
