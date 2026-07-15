import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Tags() {
  const [tags, setTags] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#10b981');

  async function load() {
    const { data } = await api.get('/tags');
    setTags(data);
  }
  useEffect(() => { load(); }, []);

  async function add() {
    if (!name.trim()) return toast.error('Informe um nome.');
    await api.post('/tags', { name, color });
    setName(''); setColor('#10b981');
    load();
  }
  async function remove(id: string) {
    await api.delete(`/tags/${id}`);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="card flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="label">Nome da tag</label>
          <input className="input" placeholder="cliente, fornecedor, urgente..." value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} />
        </div>
        <div>
          <label className="label">Cor</label>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-[44px] w-14 cursor-pointer rounded-xl border border-ink-700/15 dark:border-white/10 bg-transparent" />
        </div>
        <button className="btn-primary" onClick={add}>+ Criar tag</button>
      </div>

      <div className="flex flex-wrap gap-3">
        <AnimatePresence>
          {tags.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="badge border px-3 py-1.5 text-sm"
              style={{ background: t.color + '22', color: t.color, borderColor: t.color + '66' }}
            >
              {t.name}
              <button onClick={() => remove(t.id)} className="ml-2 opacity-60 hover:opacity-100">✕</button>
            </motion.div>
          ))}
        </AnimatePresence>
        {tags.length === 0 && <p className="text-sm text-ink-600/60">Nenhuma tag ainda.</p>}
      </div>
    </div>
  );
}
