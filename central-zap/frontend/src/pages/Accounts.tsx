import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAccounts } from '../hooks/useAccounts';
import StatusDot, { STATUS_LABEL } from '../components/StatusDot';
import { onAccountQr } from '../services/socket';

export default function Accounts() {
  const { accounts, loading, reload } = useAccounts();
  const [name, setName] = useState('');
  const [qrFor, setQrFor] = useState<{ id: string; name: string; qr: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function addAccount() {
    if (!name.trim()) return toast.error('Informe um nome para a conta.');
    setBusy(true);
    try {
      const { data } = await api.post('/accounts', { name });
      toast.success('Conta criada. Conecte para gerar o QR Code.');
      setName('');
      await reload();
      // já inicia a conexão e abre o QR
      await connect(data.id, data.name);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Erro ao criar conta.');
    } finally {
      setBusy(false);
    }
  }

  async function connect(id: string, n: string) {
    const off = onAccountQr((e) => {
      if (e.accountId === id) setQrFor({ id, name: n, qr: e.qr });
    });
    try {
      await api.post(`/accounts/${id}/connect`);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Falha ao conectar.');
    }
    setTimeout(off, 60000); // para de ouvir após 1min
  }

  async function disconnect(id: string) {
    await api.post(`/accounts/${id}/disconnect`);
    toast('Conta desconectada.');
    reload();
  }

  async function remove(id: string) {
    if (!confirm('Remover esta conta e sua sessão?')) return;
    await api.delete(`/accounts/${id}`);
    toast.success('Conta removida.');
    reload();
  }

  async function toggleDnd(id: string, duration: string | null, currentlyOn: boolean) {
    await api.post(`/accounts/${id}/dnd`, { duration: currentlyOn ? null : duration });
    reload();
  }

  return (
    <div className="space-y-6">
      {/* Formulário de nova conta */}
      <div className="card flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="label">Nome da conta</label>
          <input
            className="input"
            placeholder="Ex: Vendas, Suporte, Pessoal..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addAccount()}
          />
        </div>
        <button className="btn-primary" onClick={addAccount} disabled={busy}>
          + Adicionar conta
        </button>
      </div>

      {loading ? (
        <p className="text-ink-600/60">Carregando contas...</p>
      ) : accounts.length === 0 ? (
        <div className="card text-center text-ink-600/60">
          Nenhuma conta ainda. Adicione sua primeira conta do WhatsApp acima.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence>
            {accounts.map((a) => (
              <motion.div
                key={a.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="card flex flex-col gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl font-bold text-white" style={{ background: a.color }}>
                    {a.name[0]?.toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{a.name}</p>
                    <p className="truncate text-xs text-ink-600/60">{a.phone || 'Não conectado'}</p>
                  </div>
                  <StatusDot status={a.status} size={10} />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="badge bg-ink-700/10 dark:bg-white/5">{STATUS_LABEL[a.status]}</span>

                  {a.dndEnabled ? (
                    <span className="badge bg-amber-500/15 text-amber-500">🔕 Não perturbe</span>
                  ) : (
                    <button onClick={() => toggleDnd(a.id, '4h', false)} className="badge bg-ink-700/10 dark:bg-white/5 hover:bg-ink-700/20">
                      Ativar DND
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {a.status === 'connected' || a.status === 'qr' || a.status === 'connecting' ? (
                    <button className="btn-ghost flex-1" onClick={() => disconnect(a.id)}>Desconectar</button>
                  ) : (
                    <button className="btn-primary flex-1" onClick={() => connect(a.id, a.name)}>Conectar</button>
                  )}
                  {a.dndEnabled && (
                    <button className="btn-ghost" title="Desativar DND" onClick={() => toggleDnd(a.id, null, true)}>🔔</button>
                  )}
                  <button className="btn-danger" onClick={() => remove(a.id)}>Excluir</button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal do QR Code */}
      <AnimatePresence>
        {qrFor && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setQrFor(null)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-strong relative w-full max-w-sm rounded-2xl p-6 text-center"
            >
              <h3 className="mb-1 font-bold">Conectar “{qrFor.name}”</h3>
              <p className="mb-4 text-xs text-ink-600/60">Abra o WhatsApp no celular e escaneie o QR Code.</p>
              <div className="rounded-xl bg-white p-3 inline-block">
                <img src={qrFor.qr} alt="QR Code" className="h-56 w-56" />
              </div>
              <p className="mt-3 text-xs text-ink-600/60">Aguardando leitura...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
