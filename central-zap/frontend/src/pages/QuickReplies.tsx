import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function QuickReplies() {
  const [items, setItems] = useState<any[]>([]);
  const [shortcut, setShortcut] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    const { data } = await api.get('/quick-replies');
    setItems(data);
  }
  useEffect(() => { load(); }, []);

  async function add() {
    if (!shortcut.trim() || !message.trim()) return toast.error('Preencha atalho e mensagem.');
    await api.post('/quick-replies', { shortcut, message });
    setShortcut(''); setMessage('');
    load();
  }
  async function remove(id: string) {
    await api.delete(`/quick-replies/${id}`);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="card flex flex-col gap-3 lg:flex-row">
        <div className="flex-1">
          <label className="label">Atalho (sem a barra)</label>
          <input className="input" placeholder="saudacao" value={shortcut} onChange={(e) => setShortcut(e.target.value)} />
        </div>
        <div className="flex-[2]">
          <label className="label">Mensagem</label>
          <input className="input" placeholder="Olá! Como posso ajudar?" value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} />
        </div>
        <button className="btn-primary lg:self-end" onClick={add}>+ Adicionar</button>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {items.map((q) => (
            <motion.div key={q.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card flex items-center gap-3">
              <span className="badge bg-accent/15 text-accent">/{q.shortcut}</span>
              <p className="flex-1 truncate text-sm">{q.message}</p>
              <button className="btn-ghost" onClick={() => remove(q.id)}>Excluir</button>
            </motion.div>
          ))}
        </AnimatePresence>
        {items.length === 0 && <p className="text-sm text-ink-600/60">Nenhuma resposta rápida.</p>}
      </div>
    </div>
  );
}
