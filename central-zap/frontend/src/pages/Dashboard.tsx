import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
} from 'recharts';
import api from '../services/api';
import Avatar from '../components/Avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Dash {
  summary: {
    totalAccounts: number;
    connectedAccounts: number;
    receivedToday: number;
    sentToday: number;
    unread: number;
  };
  volumeByHour: { hour: string; sent: number; received: number }[];
  messagesByAccount: { name: string; color: string; count: number }[];
  recentConversations: any[];
}

const cards = [
  { key: 'connectedAccounts', label: 'Contas conectadas', icon: '📡', accent: 'text-accent' },
  { key: 'receivedToday', label: 'Recebidas hoje', icon: '📥', accent: 'text-emerald-400' },
  { key: 'sentToday', label: 'Enviadas hoje', icon: '📤', accent: 'text-sky-400' },
  { key: 'unread', label: 'Conversas não lidas', icon: '🔔', accent: 'text-amber-400' },
] as const;

export default function Dashboard() {
  const [data, setData] = useState<Dash | null>(null);

  useEffect(() => {
    api.get('/dashboard').then((r) => setData(r.data)).catch(() => {});
  }, []);

  if (!data) {
    return <div className="text-ink-600/60">Carregando dashboard...</div>;
  }

  const s = data.summary;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c, i) => (
          <motion.div
            key={c.key}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">{c.icon}</span>
            </div>
            <p className={`mt-2 text-3xl font-extrabold ${c.accent}`}>{s[c.key]}</p>
            <p className="text-xs text-ink-600/60 dark:text-paper-300/60">{c.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card lg:col-span-2">
          <h3 className="mb-4 font-semibold">Volume de mensagens (últimas 24h)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.volumeByHour}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,120,120,0.15)" />
              <XAxis dataKey="hour" tick={{ fontSize: 11 }} interval={3} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', background: 'rgba(20,30,28,0.9)' }} />
              <Line type="monotone" dataKey="received" name="Recebidas" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="sent" name="Enviadas" stroke="#38bdf8" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} className="card">
          <h3 className="mb-4 font-semibold">Mensagens por conta</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.messagesByAccount}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,120,120,0.15)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', background: 'rgba(20,30,28,0.9)' }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }} className="card">
        <h3 className="mb-4 font-semibold">Conversas recentes</h3>
        <div className="divide-y divide-ink-700/10 dark:divide-white/5">
          {data.recentConversations.length === 0 && (
            <p className="py-4 text-sm text-ink-600/60">Sem conversas ainda.</p>
          )}
          {data.recentConversations.map((c) => (
            <Link key={c.contactId} to={`/chat/${c.contactId}`} className="flex items-center gap-3 py-3 hover:bg-ink-700/5 dark:hover:bg-white/5 rounded-lg px-2 transition">
              <Avatar name={c.contactName} color={c.account?.color} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{c.contactName}</p>
                <p className={`truncate text-xs ${c.fromMe ? 'text-accent' : 'text-ink-600/60'}`}>
                  {c.fromMe ? 'Você: ' : ''}{c.lastMessage}
                </p>
              </div>
              {c.lastTimestamp && (
                <span className="text-[11px] text-ink-600/50">
                  {formatDistanceToNow(new Date(c.lastTimestamp), { addSuffix: true, locale: ptBR })}
                </span>
              )}
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
