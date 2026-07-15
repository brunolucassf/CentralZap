import { io, Socket } from 'socket.io-client';

// Socket.IO client. A URL é relativa (Vite faz proxy para :3001 em dev).
let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io({ autoConnect: true, transports: ['websocket', 'polling'] });
  }
  return socket;
}

// Tipos de eventos recebidos do backend
export interface AccountStatusEvent {
  accountId: string;
  status: 'connected' | 'disconnected' | 'qr' | 'connecting';
  phone?: string;
}
export interface NewMessageEvent {
  accountId: string;
  contact: any;
  message: any;
}
export interface ReminderDueEvent {
  id: string;
  description: string;
  value: number | null;
  contactId: string;
  contactName: string;
}

// Helpers de assinatura
export function onAccountStatus(cb: (e: AccountStatusEvent) => void) {
  const s = getSocket();
  s.on('account:status', cb);
  return () => s.off('account:status', cb);
}
export function onAccountQr(cb: (e: { accountId: string; qr: string }) => void) {
  const s = getSocket();
  s.on('account:qr', cb);
  return () => s.off('account:qr', cb);
}
export function onNewMessage(cb: (e: NewMessageEvent) => void) {
  const s = getSocket();
  s.on('message:new', cb);
  return () => s.off('message:new', cb);
}
export function onReminderDue(cb: (e: ReminderDueEvent) => void) {
  const s = getSocket();
  s.on('reminder:due', cb);
  return () => s.off('reminder:due', cb);
}
