import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAccounts } from '../hooks/useAccounts';

export default function Scheduled() {
  const { accounts } = useAccounts();
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ accountId: '', phone: '', body: '', scheduledFor: '' });

  async function load() {
    const { data } = await api.get('/scheduled');
    setItems(data);
  }
  useEffect(() => { load(); }, []);

  function update(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function add() {
    if (!form.accountId || !form.phone || !form.body || !form.scheduledFor) {
      return toast.error('Preencha todos os campos.');
    }
    await api.post('/scheduled', form);
    setForm({ accountId: '', phone: '', body: '', scheduledFor: '' });
    load();
    toast.success('Mensagem agendada!');
  }

  async function cancel(id: string) {
    await api.post(`/scheduled/${id}/cancel`);
    load();
  }
  async function remove(id: string) {
    await api.delete(`/scheduled/${id}`);
    load();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <div className="card h-fit space-y-3">
        <h3 className="font-semibold">Nova mensagem agendada</h3>
        <div>
          <label className="label">Conta</label>
          <select className="input" value={form.accountId} onChange={(e) => update('accountId', e.target.value)}>
            <option value="">Selecione a conta</option>
            {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Número (DDD + número)</label>
          <input className="input" placeholder="5511999999999" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
        </div>
        <div>
          <label className="label">Mensagem</label>
          <textarea className="input min-h-[90px]" value={form.body} onChange={(e) => update('body', e.target.value)} />
        </div>
        <div>
          <label className="label">Data e hora</label>
          <input type="datetime-local" className="input" value={form.scheduledFor} onChange={(e) => update('scheduledFor', e.target.value)} />
        </div>
        <button className="btn-primary w-full" onClick={add}>Agendar envio</button>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {items.map((s) => (
            <motion.div key={s.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{s.body}</p>
                <p className="text-xs text-ink-600/60">
                  Para {s.phone} • {s.account.name} • {format(new Date(s.scheduledFor), "dd/MM HH:mm", { locale: ptBR })}
                </p>
                <span className={`badge mt-1 ${s.status === 'pending' ? 'bg-accent/15 text-accent' : s.status === 'sent' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-red-500/15 text-red-400'}`}>
                  {s.status}
                </span>
              </div>
              <div className="flex gap-2">
                {s.status === 'pending' && <button className="btn-ghost" onClick={() => cancel(s.id)}>Cancelar</button>}
                <button className="btn-ghost" onClick={() => remove(s.id)}>Excluir</button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {items.length === 0 && <p className="text-sm text-ink-600/60">Nenhuma mensagem agendada.</p>}
      </div>
    </div>
  );
}
