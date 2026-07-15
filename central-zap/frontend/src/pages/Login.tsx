import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../store/auth';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuth((s) => s.login);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Bem-vindo de volta!');
      // Transição suave antes de redirecionar
      setTimeout(() => navigate('/'), 350);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Falha no login.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Fundo em gradiente animado (mesh) */}
      <div className="absolute inset-0 gradient-mesh animate-mesh" />
      <div className="absolute inset-0 bg-black/20" />

      {/* Toggle de tema acessível antes do login */}
      <div className="absolute right-5 top-5 z-20">
        <ThemeToggle />
      </div>

      <div className="relative z-10 grid min-h-screen place-items-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="card glass-strong w-full max-w-md p-8"
        >
          <div className="mb-7 flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Logo size={64} />
            </motion.div>
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight">
              Entrar no <span className="text-accent">Central Zap</span>
            </h1>
            <p className="mt-1 text-sm text-ink-600/70 dark:text-paper-300/60">
              Gerencie várias contas do WhatsApp em um só lugar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="email">E-mail</label>
              <motion.input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                className="input"
                whileFocus={{ scale: 1.01 }}
              />
            </div>
            <div>
              <label className="label" htmlFor="password">Senha</label>
              <motion.input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input"
                whileFocus={{ scale: 1.01 }}
              />
            </div>
            <motion.button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-600/70 dark:text-paper-300/60">
            Não tem conta?{' '}
            <Link to="/register" className="font-semibold text-accent hover:underline">
              Cadastre-se
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
