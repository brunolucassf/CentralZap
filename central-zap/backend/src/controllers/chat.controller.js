// Chat individual de uma conta: histórico + envio de mensagens
import { prisma } from '../prisma/client.js';
import { sendText, getStatus } from '../services/whatsapp.manager.js';

function toJid(phone) {
  const clean = String(phone).replace(/\D/g, '');
  return `${clean}@s.whatsapp.net`;
}

// Histórico de mensagens de um contato
export async function getChat(req, res) {
  const { contactId } = req.params;
  const contact = await prisma.contact.findFirst({
    where: { id: contactId, userId: req.user.id },
    include: {
      account: { select: { id: true, name: true, color: true } },
      tags: { include: { tag: true } },
      notes: true,
      reminders: { where: { status: { in: ['pending', 'snoozed'] } } },
      messages: { orderBy: { timestamp: 'asc' } },
    },
  });
  if (!contact) return res.status(404).json({ error: 'Contato não encontrado.' });
  res.json(contact);
}

// Envia mensagem de texto para um contato (via conta dele)
export async function sendMessage(req, res) {
  const { contactId } = req.params;
  const { body } = req.body;
  if (!body || !body.trim()) return res.status(400).json({ error: 'Mensagem vazia.' });

  const contact = await prisma.contact.findFirst({
    where: { id: contactId, userId: req.user.id },
  });
  if (!contact) return res.status(404).json({ error: 'Contato não encontrado.' });

  if (getStatus(contact.accountId) !== 'connected') {
    return res.status(409).json({ error: 'A conta do WhatsApp não está conectada.' });
  }

  try {
    const message = await sendText(contact.accountId, toJid(contact.phone), body);
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Falha ao enviar mensagem.' });
  }
}
