// Universal Inbox: junta conversas de todas as contas
// Retorna última mensagem, contato, conta e contagem de não lidas.
import { prisma } from '../prisma/client.js';

export async function getInbox(req, res) {
  const { accountId, status, tagId, q } = req.query;
  const userId = req.user.id;

  // Busca contatos do usuário
  const contactWhere = { userId };
  if (accountId) contactWhere.accountId = accountId;

  // Filtro por tag (contato precisa ter a tag)
  let contactIds = null;
  if (tagId) {
    const tagged = await prisma.contactTag.findMany({
      where: { tagId },
      select: { contactId: true },
    });
    contactIds = tagged.map((t) => t.contactId);
    if (contactIds.length === 0) return res.json([]);
  }

  const contacts = await prisma.contact.findMany({
    where: { ...contactWhere, ...(contactIds ? { id: { in: contactIds } } : {}) },
    include: {
      account: { select: { id: true, name: true, color: true } },
      tags: { include: { tag: true } },
      messages: { orderBy: { timestamp: 'desc' }, take: 1 },
      _count: {
        select: { messages: { where: { fromMe: false, read: false } } },
      },
    },
  });

  // Monta a lista de conversas
  let conversations = contacts
    .map((c) => {
      const last = c.messages[0];
      return {
        contactId: c.id,
        contactName: c.name,
        phone: c.phone,
        avatar: c.avatar,
        account: c.account,
        tags: c.tags.map((ct) => ct.tag),
        lastMessage: last ? last.body : '',
        lastTimestamp: last ? last.timestamp : c.createdAt,
        fromMe: last ? last.fromMe : false,
        unread: c._count.messages,
      };
    })
    .filter((c) => c.lastMessage); // só conversas que já tiveram mensagem

  // Filtro por status read/unread
  if (status === 'unread') conversations = conversations.filter((c) => c.unread > 0);
  if (status === 'read') conversations = conversations.filter((c) => c.unread === 0);

  // Busca por nome ou conteúdo de mensagem
  if (q) {
    const term = String(q).toLowerCase();
    conversations = conversations.filter(
      (c) =>
        c.contactName.toLowerCase().includes(term) ||
        c.lastMessage.toLowerCase().includes(term)
    );
  }

  // Ordena pela mensagem mais recente
  conversations.sort((a, b) => new Date(b.lastTimestamp) - new Date(a.lastTimestamp));

  res.json(conversations);
}

// Marca as mensagens de um contato como lidas
export async function markRead(req, res) {
  const { contactId } = req.params;
  await prisma.message.updateMany({
    where: { contactId, fromMe: false },
    data: { read: true },
  });
  res.json({ ok: true });
}
