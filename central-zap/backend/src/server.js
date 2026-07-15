// ============================================================
// Ponto de entrada do backend Central Zap
// Express + Socket.IO + Prisma + agendador
// ============================================================

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

import { prisma } from './prisma/client.js';
import { setupSocketIO } from './socket/index.js';
import { reconnectAll } from './services/whatsapp.manager.js';
import { startScheduler } from './services/scheduler.service.js';

import authRoutes from './routes/auth.routes.js';
import accountRoutes from './routes/account.routes.js';
import inboxRoutes from './routes/inbox.routes.js';
import chatRoutes from './routes/chat.routes.js';
import contactRoutes from './routes/contact.routes.js';
import tagRoutes from './routes/tag.routes.js';
import noteRoutes from './routes/note.routes.js';
import quickReplyRoutes from './routes/quickreply.routes.js';
import scheduledRoutes from './routes/scheduled.routes.js';
import reminderRoutes from './routes/reminder.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import searchRoutes from './routes/search.routes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares base
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Rota de saúde
app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/inbox', inboxRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/quick-replies', quickReplyRoutes);
app.use('/api/scheduled', scheduledRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/search', searchRoutes);

// Tratamento de erro genérico
app.use((err, _req, res, _next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

// Servidor HTTP + Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || '*', methods: ['GET', 'POST'] },
});
setupSocketIO(io);

server.listen(PORT, async () => {
  console.log(`\n🟢 Central Zap backend rodando em http://localhost:${PORT}`);
  try {
    await prisma.$connect();
    console.log('💾 Conectado ao banco SQLite (Prisma).');
    startScheduler();
    await reconnectAll();
  } catch (err) {
    console.error('Falha ao iniciar serviços:', err);
  }
});
