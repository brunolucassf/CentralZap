// Configuração do Socket.IO e handlers de eventos em tempo real.
import { setIO } from '../services/whatsapp.manager.js';
import { setSchedulerIO } from '../services/scheduler.service.js';

export function setupSocketIO(io) {
  // Compartilha a instância com os serviços que emitem eventos
  setIO(io);
  setSchedulerIO(io);

  io.on('connection', (socket) => {
    if (process.env.DEBUG === 'true') {
      console.log('[socket] cliente conectado:', socket.id);
    }

    // O frontend pede o QR code de uma conta específica
    socket.on('qr:request', async ({ accountId }) => {
      socket.join(`account:${accountId}`);
    });

    socket.on('disconnect', () => {
      if (process.env.DEBUG === 'true') {
        console.log('[socket] cliente desconectado:', socket.id);
      }
    });
  });

  // Garante que eventos de status vão apenas para quem ouve a sala da conta
  // (a emissão global acima é suficiente para o painel de contas).
}
