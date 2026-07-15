// Controller de contatos
import { z } from 'zod';
import { prisma } from '../prisma/client.js';

const createSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  accountId: z.string().min(1),
});

export async function listContacts(req, res) {
  const { accountId } = req.query;
  const where = { userId: req.user.id };
  if (accountId) where.accountId = accountId;

  const contacts = await prisma.contact.findMany({
    where,
    include: { tags: { include: { tag: true } }, account: { select: { id: true, name: true, color: true } } },
    orderBy: { name: 'asc' },
  });
  res.json(contacts);
}

export async function createContact(req, res) {
  try {
    const { name, phone, accountId } = createSchema.parse(req.body);
    const account = await prisma.whatsappAccount.findFirst({ where: { id: accountId, userId: req.user.id } });
    if (!account) return res.status(404).json({ error: 'Conta não encontrada.' });

    const contact = await prisma.contact.create({
      data: { name, phone, accountId, userId: req.user.id },
    });
    res.status(201).json(contact);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function deleteContact(req, res) {
  await prisma.contact.deleteMany({ where: { id: req.params.id, userId: req.user.id } });
  res.json({ ok: true });
}
