// Busca global (Ctrl+K): contatos, mensagens e conversas
import { prisma } from '../prisma/client.js';

export async function globalSearch(req, res) {
  const { q } = req.query;
  if (!q) return res.json({ contacts: [], messages: [], conversations: [] });

  const term = String(q).toLowerCase();

  const contacts = await prisma.contact.findMany({
    where: {
      userId: req.user.id,
      OR: [{ name: { contains: term } }, { phone: { contains: term } }],
    },
    include: { account: { select: { id: true, name: true, color: true } } },
    take: 10,
  });

  const messages = await prisma.message.findMany({
    where: { userId: req.user.id, body: { contains: term } },
    include: {
      contact: { select: { id: true, name: true } },
      account: { select: { id: true, name: true, color: true } },
    },
    orderBy: { timestamp: 'desc' },
    take: 10,
  });

  // Conversas = contatos que têm mensagem contendo o termo
  const conversations = await prisma.contact.findMany({
    where: {
      userId: req.user.id,
      messages: { some: { body: { contains: term } } },
    },
    include: {
      account: { select: { id: true, name: true, color: true } },
      messages: { where: { body: { contains: term } }, orderBy: { timestamp: 'desc' }, take: 1 },
    },
    take: 10,
  });

  res.json({
    contacts: contacts.map((c) => ({ type: 'contact', id: c.id, title: c.name, subtitle: c.phone, account: c.account })),
    messages: messages.map((m) => ({
      type: 'message',
      id: m.id,
      contactId: m.contact.id,
      title: m.contact.name,
      subtitle: m.body,
      account: m.account,
    })),
    conversations: conversations.map((c) => ({
      type: 'conversation',
      id: c.id,
      title: c.name,
      subtitle: c.messages[0]?.body || '',
      account: c.account,
    })),
  });
}
