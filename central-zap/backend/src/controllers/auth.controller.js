// Controller de autenticação (login, registro, perfil)
import { z } from 'zod';
import { prisma } from '../prisma/client.js';
import { hashPassword, comparePassword, signToken } from '../services/auth.service.js';

const registerSchema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
});

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
});

export async function register(req, res) {
  try {
    const { name, email, password } = registerSchema.parse(req.body);
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ error: 'E-mail já cadastrado.' });

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, email, password: hashed },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    const token = signToken({ id: user.id, email: user.email });
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Erro ao registrar.' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Credenciais inválidas.' });

    const ok = await comparePassword(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Credenciais inválidas.' });

    const token = signToken({ id: user.id, email: user.email });
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Erro ao fazer login.' });
  }
}

export async function me(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, createdAt: true },
  });
  res.json(user);
}
