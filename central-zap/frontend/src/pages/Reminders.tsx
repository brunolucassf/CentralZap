import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Reminders() {
  const [reminders, setReminders] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [form, setForm] = useState({ contactId: '', description: '', value: '', dueAt: '', recurrence: 'once' });

  async function load() {
    const [{ data: r }, { data: c }] = await Promise.all([api.get('/reminders'), api.get('/contacts')]);
    setReminders(r);
    setContacts(c);
  }
  useEffect(() => { load(); }, []);

  function update(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function add() {
    if (!form.contactId || !form.description || !form.dueAt) {
      return toast.error('Contato, descrição e data são obrigatórios.');
    }
    await api.post('/reminders', {
      contactId: form.contactId,
      description: form.description,
      value: form.value ? parseFloat(form.value) : undefined,
      dueAt: form.dueAt,
      recurrence: form.recurrence,
    });
    setForm({ contactId: '', description: '', value: '', dueAt: '', recurrence: 'once' });
    load();
    toast.success('Lembrete criado!');
  }

  async function complete(id: string) {
    await api.post(`/reminders/${id}/complete`);
    load();
  }
  async function snooze(id: string) {
    await api.post(`/reminders/${id}/snooze`);
    load();
  }
  async function remove(id: string) {
    await api.delete(`/reminders/${id}`);
    load();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
      <div className="card h-fit space-y-3">
        <h3 className="font-semibold">Novo lembrete</h3>
        <div>
          <label className="label">Contato</label>
          <select className="input" value={form.contactId} onChange={(e) => update('contactId', e.target.value)}>
            <option value="">Selecione o contato</option>
            {contacts.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
          </select>
        </div>
        <div>
          <label className="label">Descrição</label>
          <input className="input" placeholder="Ex: vai pagar dia 15" value={form.description} onChange={(e) => update('description', e.target.value)} />
        </div>
        <div>
          <label className="label">Valor (R$, opcional)</label>
          <input type="number" step="0.01" className="input" placeholder="0,00" value={form.value} onChange={(e) => update('value', e.target.value)} />
        </div>
        <div>
          <label className="label">Data e hora</label>
          <input type="datetime-local" className="input" value={form.dueAt} onChange={(e) => update('dueAt', e.target.value)} />
        </div>
        <div>
          <label className="label">Recorrência</label>
          <select className="input" value={form.recurrence} onChange={(e) => update('recurrence', e.target.value)}>
            <option value="once">Única vez</option>
            <option value="monthly">Mensal</option>
          </select>
        </div>
        <button className="btn-primary w-full" onClick={add}>Criar lembrete</button>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {reminders.map((r) => (
            <motion.div key={r.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card flex items-center gap-3">
              <span className="text-2xl">⏰</span>
              <div className="min-w-0 flex-1">
                <Link to={`/chat/${r.contactId}`} className="text-sm font-medium text-accent hover:underline">{r.contact.name}</Link>
                <p className="truncate text-sm">{r.description}{r.value ? ` — R$ ${r.value.toFixed(2)}` : ''}</p>
                <p className="text-xs text-ink-600/60">
                  {format(new Date(r.dueAt), "dd/MM/yyyy HH:mm", { locale: ptBR })} • {r.recurrence === 'monthly' ? 'Mensal' : 'Único'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="btn-primary" onClick={() => complete(r.id)}>Concluir</button>
                <button className="btn-ghost" onClick={() => snooze(r.id)}>Adiar</button>
                <button className="btn-ghost" onClick={() => remove(r.id)}>Excluir</button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {reminders.length === 0 && <p className="text-sm text-ink-600/60">Nenhum lembrete pendente.</p>}
      </div>
    </div>
  );
}
