import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useCommandPalette } from '../store/commandPalette';
import api from '../services/api';

interface Result {
  type: 'contact' | 'message' | 'conversation';
  id: string;
  contactId?: string;
  title: string;
  subtitle: string;
  account?: { name: string; color: string };
}

export default function CommandPalette() {
  const { isOpen, close } = useCommandPalette();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;
    setQuery('');
    setResults([]);
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    api
      .get('/search', { params: { q: query }, signal: ctrl.signal })
      .then((res) => {
        const { contacts, messages, conversations } = res.data;
        const merged: Result[] = [
          ...contacts.map((c: any) => ({ ...c, subtitle: c.subtitle || '' })),
          ...conversations,
          ...messages,
        ];
        setResults(merged.slice(0, 20));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [query, isOpen]);

  function go(r: Result) {
    close();
    navigate(`/chat/${r.contactId || r.id}`);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={close} />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.18 }}
            className="glass-strong relative w-full max-w-xl rounded-2xl shadow-glass overflow-hidden"
          >
            <div className="flex items-center gap-3 border-b border-ink-700/15 dark:border-white/10 px-4">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-600/60"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar contatos, conversas e mensagens..."
                className="w-full bg-transparent py-4 text-sm outline-none placeholder:text-ink-600/40"
              />
              <kbd className="rounded bg-ink-700/20 px-1.5 text-[10px] font-semibold">ESC</kbd>
            </div>

            <div className="max-h-[50vh] overflow-y-auto p-2">
              {loading && <p className="p-4 text-sm text-ink-600/60">Buscando...</p>}
              {!loading && query && results.length === 0 && (
                <p className="p-4 text-sm text-ink-600/60">Nenhum resultado.</p>
              )}
              {!query && <p className="p-4 text-sm text-ink-600/60">Digite para buscar em todas as contas.</p>}

              {results.map((r, i) => (
                <button
                  key={`${r.type}-${r.id}`}
                  onClick={() => go(r)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-accent/10 transition"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ background: r.account?.color || '#10b981' }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{r.title}</p>
                    <p className="truncate text-xs text-ink-600/60 dark:text-paper-300/50">{r.subtitle}</p>
                  </div>
                  <span className="badge bg-ink-700/10 dark:bg-white/5 text-[10px] uppercase">{r.type}</span>
                </button>
              ))}
            </div>
          </motion.div>

          <EscListener onEsc={close} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function EscListener({ onEsc }: { onEsc: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onEsc();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onEsc]);
  return null;
}
