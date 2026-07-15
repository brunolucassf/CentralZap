// Respostas rápidas (atalhos "/")
import { z } from 'zod';
import { prisma } from '../prisma/client.js';

const schema = z.object({
  shortcut: z.string().min(1),
  message: z.string().min(1),
});

export async function listQuickReplies(req, res) {
  const items = await prisma.quickReply.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json(items);
}

export async function createQuickReply(req, res) {
  try {
    const { shortcut, message } = schema.parse(req.body);
    const item = await prisma.quickReply.create({
      data: { shortcut, message, userId: req.user.id },
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function deleteQuickReply(req, res) {
  await prisma.quickReply.deleteMany({ where: { id: req.params.id, userId: req.user.id } });
  res.json({ ok: true });
}
