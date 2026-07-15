// Mensagens agendadas
import { z } from 'zod';
import { prisma } from '../prisma/client.js';

const schema = z.object({
  accountId: z.string().min(1),
  phone: z.string().min(1),
  body: z.string().min(1),
  scheduledFor: z.string().min(1), // ISO date string
});

export async function listScheduled(req, res) {
  const items = await prisma.scheduledMessage.findMany({
    where: { userId: req.user.id },
    include: { account: { select: { id: true, name: true } } },
    orderBy: { scheduledFor: 'asc' },
  });
  res.json(items);
}

export async function createScheduled(req, res) {
  try {
    const { accountId, phone, body, scheduledFor } = schema.parse(req.body);
    const account = await prisma.whatsappAccount.findFirst({ where: { id: accountId, userId: req.user.id } });
    if (!account) return res.status(404).json({ error: 'Conta não encontrada.' });

    const item = await prisma.scheduledMessage.create({
      data: {
        accountId,
        phone,
        body,
        scheduledFor: new Date(scheduledFor),
        userId: req.user.id,
      },
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function cancelScheduled(req, res) {
  const item = await prisma.scheduledMessage.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!item) return res.status(404).json({ error: 'Agendamento não encontrado.' });
  await prisma.scheduledMessage.update({ where: { id: item.id }, data: { status: 'cancelled' } });
  res.json({ ok: true });
}

export async function deleteScheduled(req, res) {
  await prisma.scheduledMessage.deleteMany({ where: { id: req.params.id, userId: req.user.id } });
  res.json({ ok: true });
}
