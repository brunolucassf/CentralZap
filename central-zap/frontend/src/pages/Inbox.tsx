import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAccounts } from '../hooks/useAccounts';
import Avatar from '../components/Avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Conversation {
  contactId: string;
  contactName: string;
  phone: string;
  lastMessage: string;
  lastTimestamp: string;
  fromMe: boolean;
  unread: number;
  account: { id: string; name: string; color: string };
  tags: { id: string; name: string; color: string }[];
}

export default function Inbox() {
  const { accounts } = useAccounts();
  const [items, setItems] = useState<Conversation[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [accountId, setAccountId] = useState('');
  const [status, setStatus] = useState('');
  const [tagId, setTagId] = useState('');
  const [q, setQ] = useState('');

  async function load(t = tagId, s = status, a = accountId, query = q) {
    const params: any = { accountId: a, status: s, tagId: t, q: query };
    const { data } = await api.get('/inbox', { params });
    setItems(data);
  }

  useEffect(() => {
    load();
    api.get('/tags').then((r) => setTags(r.data)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="card flex flex-wrap items-center gap-3">
        <input
          className="input max-w-xs flex-1"
          placeholder="Buscar por nome ou mensagem..."
          value={q}
          onChange={(e) => { setQ(e.target.value); load(tagId, status, accountId, e.target.value); }}
        />
        <select value={accountId} onChange={(e) => { setAccountId(e.target.value); load(tagId, status, e.target.value, q); }} className="input max-w-[180px]">
          <option value="">Todas as contas</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); load(tagId, e.target.value, accountId, q); }} className="input max-w-[160px]">
          <option value="">Todos os status</option>
          <option value="unread">Não lidas</option>
          <option value="read">Lidas</option>
        </select>
        <select value={tagId} onChange={(e) => { setTagId(e.target.value); load(e.target.value, status, accountId, q); }} className="input max-w-[160px]">
          <option value="">Todas as tags</option>
          {tags.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      {/* Lista */}
      <div className="card p-2">
        {items.length === 0 && <p className="p-6 text-center text-ink-600/60">Nenhuma conversa encontrada.</p>}
        <div className="divide-y divide-ink-700/10 dark:divide-white/5">
          {items.map((c, i) => (
            <motion.div key={c.contactId} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
              <Link to={`/chat/${c.contactId}`} className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-ink-700/5 dark:hover:bg-white/5 transition">
                <Avatar name={c.contactName} color={c.account?.color} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold">{c.contactName}</p>
                    <span className="badge text-[10px]" style={{ background: c.account.color + '22', color: c.account.color }}>
                      {c.account.name}
                    </span>
                  </div>
                  <p className={`truncate text-xs ${c.unread > 0 ? 'font-medium text-ink-800 dark:text-paper-200' : 'text-ink-600/60'}`}>
                    {c.fromMe ? 'Você: ' : ''}{c.lastMessage}
                  </p>
                  <div className="mt-0.5 flex gap-1">
                    {c.tags?.map((t) => (
                      <span key={t.id} className="badge text-[9px]" style={{ background: t.color + '22', color: t.color }}>{t.name}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {c.lastTimestamp && (
                    <span className="text-[10px] text-ink-600/50">
                      {formatDistanceToNow(new Date(c.lastTimestamp), { addSuffix: true, locale: ptBR })}
                    </span>
                  )}
                  {c.unread > 0 && (
                    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1.5 text-[11px] font-bold text-white">
                      {c.unread}
                    </span>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
