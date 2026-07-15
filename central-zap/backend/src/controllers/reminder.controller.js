// Lembretes vinculados a contatos
import { z } from 'zod';
import { prisma } from '../prisma/client.js';

const schema = z.object({
  contactId: z.string().min(1),
  description: z.string().min(1),
  value: z.number().optional(),
  dueAt: z.string().min(1), // ISO
  recurrence: z.enum(['once', 'monthly']).default('once'),
});

export async function listReminders(req, res) {
  const items = await prisma.reminder.findMany({
    where: { userId: req.user.id, status: { in: ['pending', 'snoozed'] } },
    include: { contact: { select: { id: true, name: true, phone: true } } },
    orderBy: { dueAt: 'asc' },
  });
  res.json(items);
}

export async function createReminder(req, res) {
  try {
    const { contactId, description, value, dueAt, recurrence } = schema.parse(req.body);
    const contact = await prisma.contact.findFirst({ where: { id: contactId, userId: req.user.id } });
    if (!contact) return res.status(404).json({ error: 'Contato não encontrado.' });

    const item = await prisma.reminder.create({
      data: {
        contactId,
        description,
        value: value ?? null,
        dueAt: new Date(dueAt),
        recurrence,
        userId: req.user.id,
      },
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// Ações: concluir, adiar, remover
export async function completeReminder(req, res) {
  await prisma.reminder.updateMany({ where: { id: req.params.id, userId: req.user.id }, data: { status: 'done' } });
  res.json({ ok: true });
}

export async function snoozeReminder(req, res) {
  // Adia por 1 hora
  await prisma.reminder.updateMany({
    where: { id: req.params.id, userId: req.user.id },
    data: { status: 'snoozed', dueAt: new Date(Date.now() + 60 * 60 * 1000) },
  });
  res.json({ ok: true });
}

export async function deleteReminder(req, res) {
  await prisma.reminder.updateMany({ where: { id: req.params.id, userId: req.user.id }, data: { status: 'deleted' } });
  res.json({ ok: true });
}
