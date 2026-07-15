import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

import './index.css';
import { useAuth } from './store/auth';

import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Inbox from './pages/Inbox';
import Chat from './pages/Chat';
import Accounts from './pages/Accounts';
import Tags from './pages/Tags';
import QuickReplies from './pages/QuickReplies';
import Scheduled from './pages/Scheduled';
import Reminders from './pages/Reminders';
import CommandPalette from './components/CommandPalette';

// Protege rotas autenticadas
function Protected({ children }) {
  const token = useAuth((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AnimatedRoutes() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <Protected>
              <Layout />
            </Protected>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="inbox" element={<Inbox />} />
          <Route path="chat/:contactId" element={<Chat />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="tags" element={<Tags />} />
          <Route path="quick-replies" element={<QuickReplies />} />
          <Route path="scheduled" element={<Scheduled />} />
          <Route path="reminders" element={<Reminders />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const loadFromStorage = useAuth((s) => s.loadFromStorage);
  React.useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return (
    <BrowserRouter>
      <AnimatedRoutes />
      <CommandPalette />
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'glass-strong !rounded-xl',
          style: { color: 'inherit' },
        }}
      />
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
