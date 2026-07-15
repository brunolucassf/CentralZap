// ============================================================
// Agendador de mensagens e lembretes usando node-cron.
// Mensagens agendadas e lembretes pendentes são checados a cada minuto.
// ============================================================

import cron from 'node-cron';
import { prisma } from '../prisma/client.js';
import { sendText, connectAccount } from './whatsapp.manager.js';

let io = null;
export function setSchedulerIO(ioInstance) {
  io = ioInstance;
}

// Converte um número "5511999999999" ou "+55..." em jid do WhatsApp
function toJid(phone) {
  const clean = phone.replace(/\D/g, '');
  return `${clean}@s.whatsapp.net`;
}

async function processScheduledMessages() {
  try {
    const now = new Date();
    const pending = await prisma.scheduledMessage.findMany({
      where: { status: 'pending', scheduledFor: { lte: now } },
    });

    for (const sm of pending) {
      try {
        await connectAccountIfNeeded(sm.accountId);
        await sendText(sm.accountId, toJid(sm.phone), sm.body);
        await prisma.scheduledMessage.update({
          where: { id: sm.id },
          data: { status: 'sent' },
        });
      } catch (err) {
        console.error('Falha ao enviar mensagem agendada', sm.id, err.message);
        await prisma.scheduledMessage.update({
          where: { id: sm.id },
          data: { status: 'failed' },
        });
      }
    }
  } catch (err) {
    console.error('Erro no scheduler de mensagens:', err);
  }
}

async function processReminders() {
  try {
    const now = new Date();
    const due = await prisma.reminder.findMany({
      where: { status: 'pending', dueAt: { lte: now } },
      include: { contact: true },
    });

    for (const r of due) {
      // Marca como "snoozed" temporariamente para não disparar em loop (será confirmado pelo usuário)
      await prisma.reminder.update({
        where: { id: r.id },
        data: { status: 'snoozed' },
      });
      if (io) {
        io.emit('reminder:due', {
          id: r.id,
          description: r.description,
          value: r.value,
          contactId: r.contactId,
          contactName: r.contact?.name,
        });
      }
    }
  } catch (err) {
    console.error('Erro no scheduler de lembretes:', err);
  }
}

async function connectAccountIfNeeded(accountId) {
  // Import dinâmico para evitar ciclo no topo do arquivo
  const { getStatus } = await import('./whatsapp.manager.js');
  if (getStatus(accountId) !== 'connected') {
    await connectAccount(accountId);
  }
}

let started = false;
export function startScheduler() {
  if (started) return;
  started = true;
  // Roda a cada minuto
  cron.schedule('* * * * *', async () => {
    await processScheduledMessages();
    await processReminders();
  });
  console.log('[scheduler] Agendador iniciado (checagem a cada minuto).');
}
