import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from './Logo';
import { useAuth } from '../store/auth';

interface Item {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const I = {
  dashboard: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
  ),
  inbox: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
  ),
  accounts: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
  ),
  tags: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41 13.42 20.6a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7" cy="7" r="1.5" fill="currentColor"/></svg>
  ),
  quick: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
  ),
  scheduled: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
  ),
  reminders: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
  ),
};

const items: Item[] = [
  { to: '/', label: 'Dashboard', icon: I.dashboard },
  { to: '/inbox', label: 'Inbox', icon: I.inbox },
  { to: '/accounts', label: 'Contas', icon: I.accounts },
  { to: '/tags', label: 'Tags', icon: I.tags },
  { to: '/quick-replies', label: 'Respostas Rápidas', icon: I.quick },
  { to: '/scheduled', label: 'Agendadas', icon: I.scheduled },
  { to: '/reminders', label: 'Lembretes', icon: I.reminders },
];

export default function Sidebar() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-ink-700/15 dark:border-white/10 bg-paper-100/70 dark:bg-ink-900/70 backdrop-blur-xl">
      <div className="flex items-center gap-2 px-5 py-5">
        <Logo size={36} withWordmark />
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {items.map((it) => (
          <NavLink key={it.to} to={it.to} end={it.to === '/'}>
            {({ isActive }) => (
              <div className="relative">
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-accent/15 border border-accent/30"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <div className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'text-accent' : 'text-ink-600 dark:text-paper-300/70 hover:text-ink-900 dark:hover:text-paper-100'}`}>
                  {it.icon}
                  {it.label}
                </div>
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-ink-700/15 dark:border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-xl px-3 py-2">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-accent/20 font-semibold text-accent">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user?.name}</p>
            <p className="truncate text-xs text-ink-600/60 dark:text-paper-300/50">{user?.email}</p>
          </div>
          <button onClick={logout} title="Sair" className="btn-ghost h-8 w-8 p-0 grid place-items-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
