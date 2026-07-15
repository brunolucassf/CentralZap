// ============================================================
// Gerenciador de contas WhatsApp (Baileys)
// Mantém em memória os sockets ativos e emite eventos via Socket.IO.
// Cada conta conectada vive numa subpasta de sessions/{accountId}.
// ============================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { useMultiFileAuthState, DisconnectReason, makeWASocket } from '@whiskeysockets/baileys';
import QRCode from 'qrcode';
import { prisma } from '../prisma/client.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SESSIONS_DIR = path.resolve(__dirname, '../../sessions');

// Mapa de sockets ativos: accountId -> { sock, status }
const connections = new Map();

// Referência ao servidor Socket.IO (definida em setupSocketIO)
let io = null;
export function setIO(ioInstance) {
  io = ioInstance;
}

function emitStatus(accountId, status, extra = {}) {
  if (io) io.emit('account:status', { accountId, status, ...extra });
}

async function ensureSessionDir(accountId) {
  const dir = path.join(SESSIONS_DIR, accountId);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

// Cria (ou retorna) uma conexão para a conta
export async function connectAccount(accountId) {
  if (connections.has(accountId)) {
    const c = connections.get(accountId);
    if (c.status === 'connected') return c.sock;
  }

  const authDir = await ensureSessionDir(accountId);
  const { state, saveCreds } = await useMultiFileAuthState(authDir);

  // Atualiza status para "connecting"
  await prisma.whatsappAccount.update({
    where: { id: accountId },
    data: { status: 'connecting' },
  }).catch(() => {});
  emitStatus(accountId, 'connecting');

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    browser: ['Central Zap', 'Chrome', '1.0.0'],
  });

  connections.set(accountId, { sock, status: 'connecting' });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      // Gera QR code em data URL e envia para o frontend
      const qrDataUrl = await QRCode.toDataURL(qr);
      await prisma.whatsappAccount.update({
        where: { id: accountId },
        data: { status: 'qr' },
      }).catch(() => {});
      emitStatus(accountId, 'qr');
      if (io) io.emit('account:qr', { accountId, qr: qrDataUrl });
    }

    if (connection === 'open') {
      await prisma.whatsappAccount.update({
        where: { id: accountId },
        data: {
          status: 'connected',
          phone: sock.user?.id?.split(':')[0] || null,
          lastActivityAt: new Date(),
        },
      }).catch(() => {});
      emitStatus(accountId, 'connected', { phone: sock.user?.id?.split(':')[0] });
    }

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      const reason = lastDisconnect?.error?.output?.statusCode;
      // Se foi logout, marca desconectado; senão tenta reconectar automaticamente
      if (shouldReconnect && reason !== DisconnectReason.loggedOut) {
        emitStatus(accountId, 'connecting');
        connectAccount(accountId);
      } else {
        await prisma.whatsappAccount.update({
          where: { id: accountId },
          data: { status: 'disconnected' },
        }).catch(() => {});
        emitStatus(accountId, 'disconnected');
        connections.delete(accountId);
      }
    }
  });

  // Recebimento de mensagens
  sock.ev.on('messages.upsert', async (m) => {
    for (const msg of m.messages) {
      await handleIncomingMessage(accountId, sock, msg);
    }
  });

  return sock;
}

// Processa mensagem recebida
async function handleIncomingMessage(accountId, sock, msg) {
  try {
    if (!msg.message || msg.key.fromMe) return;
    const account = await prisma.whatsappAccount.findUnique({ where: { id: accountId } });
    if (!account) return;

    const senderId = msg.key.remoteJid;
    if (!senderId || senderId.endsWith('@g.us')) return; // ignora grupos

    const text = extractText(msg);
    if (!text) return;

    // Cria/atualiza contato
    let contact = await prisma.contact.findFirst({
      where: { phone: senderId, accountId },
    });
    if (!contact) {
      const name = msg.pushName || senderId.split('@')[0];
      contact = await prisma.contact.create({
        data: {
          name,
          phone: senderId,
          accountId,
          userId: account.userId,
        },
      });
    }

    const message = await prisma.message.create({
      data: {
        body: text,
        fromMe: false,
        read: false,
        timestamp: new Date(msg.messageTimestamp * 1000),
        contactId: contact.id,
        accountId,
        userId: account.userId,
      },
    });

    await prisma.whatsappAccount.update({
      where: { id: accountId },
      data: { lastActivityAt: new Date() },
    }).catch(() => {});

    if (io) io.emit('message:new', { accountId, contact, message });
  } catch (err) {
    console.error('Erro ao processar mensagem recebida:', err);
  }
}

function extractText(msg) {
  const m = msg.message;
  if (!m) return '';
  if (m.conversation) return m.conversation;
  if (m.extendedTextMessage?.text) return m.extendedTextMessage.text;
  if (m.imageMessage?.caption) return m.imageMessage.caption;
  if (m.buttonsResponseMessage?.selectedButtonId) return '';
  return '';
}

export async function disconnectAccount(accountId) {
  const c = connections.get(accountId);
  if (c?.sock) {
    try { await c.sock.logout(); } catch (_) {}
    c.sock.end?.();
  }
  connections.delete(accountId);
  await prisma.whatsappAccount.update({
    where: { id: accountId },
    data: { status: 'disconnected' },
  }).catch(() => {});
  emitStatus(accountId, 'disconnected');
}

export async function deleteAccount(accountId) {
  await disconnectAccount(accountId);
  const dir = path.join(SESSIONS_DIR, accountId);
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}

// Envia uma mensagem de texto por uma conta
export async function sendText(accountId, jid, text) {
  let c = connections.get(accountId);
  if (!c) {
    await connectAccount(accountId);
    c = connections.get(accountId);
  }
  const sock = c?.sock;
  if (!sock) throw new Error('Conta não está conectada.');

  const result = await sock.sendMessage(jid, { text });

  const account = await prisma.whatsappAccount.findUnique({ where: { id: accountId } });
  let contact = await prisma.contact.findFirst({ where: { phone: jid, accountId } });
  if (!contact && account) {
    contact = await prisma.contact.create({
      data: { name: jid.split('@')[0], phone: jid, accountId, userId: account.userId },
    });
  }
  if (contact) {
    const message = await prisma.message.create({
      data: {
        body: text,
        fromMe: true,
        status: 'sent',
        read: true,
        timestamp: new Date(),
        contactId: contact.id,
        accountId,
        userId: account.userId,
      },
    });
    if (io) io.emit('message:new', { accountId, contact, message });
    return message;
  }
  return result;
}

export function getStatus(accountId) {
  return connections.get(accountId)?.status || 'disconnected';
}

// Reconecta todas as contas que estavam "connected" ao iniciar o servidor
export async function reconnectAll() {
  try {
    const accounts = await prisma.whatsappAccount.findMany({
      where: { status: { in: ['connected', 'qr', 'connecting'] } },
    });
    for (const acc of accounts) {
      connectAccount(acc.id);
    }
  } catch (err) {
    console.error('Erro ao reconectar contas:', err);
  }
}
