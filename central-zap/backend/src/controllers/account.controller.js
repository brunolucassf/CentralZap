// Controller de contas WhatsApp: CRUD + conexão via Baileys
import { z } from 'zod';
import path from 'path';
import { prisma } from '../prisma/client.js';
import {
  connectAccount,
  disconnectAccount,
  deleteAccount,
  getStatus,
} from '../services/whatsapp.manager.js';

const createSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  color: z.string().optional(),
});

// Lista todas as contas do usuário com status atual
export async function listAccounts(req, res) {
  const accounts = await prisma.whatsappAccount.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
  });
  const withStatus = accounts.map((a) => ({
    ...a,
    liveStatus: getStatus(a.id),
  }));
  res.json(withStatus);
}

// Cria uma conta (ainda não conectada)
export async function createAccount(req, res) {
  try {
    const { name, color } = createSchema.parse(req.body);
    const sessionPath = `./sessions/${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const account = await prisma.whatsappAccount.create({
      data: {
        name,
        color: color || '#10b981',
        sessionPath,
        userId: req.user.id,
      },
    });
    res.status(201).json(account);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// Inicia a conexão (gera QR via socket)
export async function connect(req, res) {
  const { id } = req.params;
  const account = await prisma.whatsappAccount.findFirst({
    where: { id, userId: req.user.id },
  });
  if (!account) return res.status(404).json({ error: 'Conta não encontrada.' });

  await connectAccount(id);
  res.json({ message: 'Conexão iniciada. Aguarde o QR Code.' });
}

// Desconecta a conta
export async function disconnect(req, res) {
  const { id } = req.params;
  await disconnectAccount(id);
  res.json({ message: 'Conta desconectada.' });
}

// Remove a conta e sua pasta de sessão
export async function removeAccount(req, res) {
  const { id } = req.params;
  const account = await prisma.whatsappAccount.findFirst({
    where: { id, userId: req.user.id },
  });
  if (!account) return res.status(404).json({ error: 'Conta não encontrada.' });

  await deleteAccount(id);
  await prisma.whatsappAccount.delete({ where: { id } });
  res.json({ message: 'Conta removida.' });
}

// Alterna Não Perturbe (DND)
export async function toggleDnd(req, res) {
  const { id } = req.params;
  const { duration } = req.body || {}; // 1h | 4h | 8h | null
  const account = await prisma.whatsappAccount.findFirst({
    where: { id, userId: req.user.id },
  });
  if (!account) return res.status(404).json({ error: 'Conta não encontrada.' });

  const nowEnabled = !account.dndEnabled;
  let dndUntil = null;
  if (nowEnabled && duration) {
    const hours = { '1h': 1, '4h': 4, '8h': 8 }[duration];
    if (hours) dndUntil = new Date(Date.now() + hours * 3600 * 1000);
  }

  const updated = await prisma.whatsappAccount.update({
    where: { id },
    data: { dndEnabled: nowEnabled, dndUntil },
  });
  res.json(updated);
}
