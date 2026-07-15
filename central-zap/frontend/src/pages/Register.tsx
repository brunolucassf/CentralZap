import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../store/auth';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const register = useAuth((s) => s.register);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success('Conta criada com sucesso!');
      setTimeout(() => navigate('/'), 350);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Falha no cadastro.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 gradient-mesh animate-mesh" />
      <div className="absolute inset-0 bg-black/20" />
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
            <Logo size={64} />
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight">
              Criar conta
            </h1>
            <p className="mt-1 text-sm text-ink-600/70 dark:text-paper-300/60">
              Comece a gerenciar suas contas do WhatsApp.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="name">Nome</label>
              <input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" className="input" />
            </div>
            <div>
              <label className="label" htmlFor="email">E-mail</label>
              <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" className="input" />
            </div>
            <div>
              <label className="label" htmlFor="password">Senha</label>
              <input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className="input" />
            </div>
            <motion.button type="submit" disabled={loading} className="btn-primary w-full" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              {loading ? 'Criando...' : 'Criar conta'}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-600/70 dark:text-paper-300/60">
            Já tem conta?{' '}
            <Link to="/login" className="font-semibold text-accent hover:underline">Entrar</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
