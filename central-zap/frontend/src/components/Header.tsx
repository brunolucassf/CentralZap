import ThemeToggle from './ThemeToggle';
import { useCommandPalette } from '../store/commandPalette';

const titles: Record<string, string> = {
  '/': 'Dashboard',
  '/inbox': 'Inbox Universal',
  '/accounts': 'Contas do WhatsApp',
  '/tags': 'Tags',
  '/quick-replies': 'Respostas Rápidas',
  '/scheduled': 'Mensagens Agendadas',
  '/reminders': 'Lembretes',
};

export default function Header() {
  const open = useCommandPalette((s) => s.open);
  const path = typeof window !== 'undefined' ? window.location.pathname : '/';

  return (
    <header className="flex items-center justify-between border-b border-ink-700/15 dark:border-white/10 bg-paper-50/60 dark:bg-ink-950/60 backdrop-blur-xl px-6 py-4">
      <h1 className="text-xl font-bold tracking-tight">
        {titles[path] || 'Central Zap'}
      </h1>

      <div className="flex items-center gap-3">
        <button
          onClick={open}
          className="hidden sm:flex items-center gap-2 rounded-xl bg-ink-700/10 dark:bg-white/5 px-3 py-2 text-sm text-ink-600/70 dark:text-paper-300/60 hover:bg-ink-700/20 dark:hover:bg-white/10 transition"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          Buscar... <kbd className="ml-1 rounded bg-ink-700/20 px-1.5 text-[10px] font-semibold">Ctrl K</kbd>
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}
