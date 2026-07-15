// Métricas do dashboard
import { prisma } from '../prisma/client.js';

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export async function getDashboard(req, res) {
  const userId = req.user.id;
  const today = startOfToday();
  const now = new Date();

  // Contas conectadas
  const accounts = await prisma.whatsappAccount.findMany({ where: { userId } });
  const totalAccounts = accounts.length;
  const connectedAccounts = accounts.filter((a) => a.status === 'connected').length;

  // Mensagens de hoje
  const receivedToday = await prisma.message.count({
    where: { userId, fromMe: false, timestamp: { gte: today } },
  });
  const sentToday = await prisma.message.count({
    where: { userId, fromMe: true, timestamp: { gte: today } },
  });

  // Conversas não lidas (contatos com mensagens recebidas não lidas)
  const unread = await prisma.message.count({
    where: { userId, fromMe: false, read: false },
  });

  // Volume por hora (últimas 24h)
  const last24 = new Date(now.getTime() - 24 * 3600 * 1000);
  const msgs = await prisma.message.findMany({
    where: { userId, timestamp: { gte: last24 } },
    select: { timestamp: true, fromMe: true },
  });
  const byHour = Array.from({ length: 24 }, (_, i) => {
    const hour = (now.getHours() - 23 + i + 24) % 24;
    return { hour: `${hour}h`, sent: 0, received: 0 };
  });
  for (const m of msgs) {
    const diffH = Math.floor((now - new Date(m.timestamp)) / 3600000);
    const idx = 23 - diffH;
    if (idx >= 0 && idx < 24) {
      if (m.fromMe) byHour[idx].sent++;
      else byHour[idx].received++;
    }
  }

  // Mensagens por conta
  const byAccount = accounts.map((a) => ({
    name: a.name,
    color: a.color,
    count: 0,
  }));
  const perAccount = await prisma.message.groupBy({
    by: ['accountId'],
    where: { userId },
    _count: true,
  });
  for (const p of perAccount) {
    const acc = byAccount.find((b) => b.name && p.accountId);
    const accRec = accounts.find((a) => a.id === p.accountId);
    if (accRec) {
      const target = byAccount.find((b) => b.name === accRec.name);
      if (target) target.count = p._count;
    }
  }

  // Conversas recentes
  const recent = await prisma.contact.findMany({
    where: { userId },
    include: {
      account: { select: { id: true, name: true, color: true } },
      messages: { orderBy: { timestamp: 'desc' }, take: 1 },
    },
  });
  const recentConversations = recent
    .map((c) => ({
      contactId: c.id,
      contactName: c.name,
      account: c.account,
      lastMessage: c.messages[0]?.body || '',
      lastTimestamp: c.messages[0]?.timestamp,
      fromMe: c.messages[0]?.fromMe || false,
    }))
    .filter((c) => c.lastMessage)
    .sort((a, b) => new Date(b.lastTimestamp) - new Date(a.lastTimestamp))
    .slice(0, 5);

  res.json({
    summary: {
      totalAccounts,
      connectedAccounts,
      receivedToday,
      sentToday,
      unread,
    },
    volumeByHour: byHour,
    messagesByAccount: byAccount,
    recentConversations,
  });
}
