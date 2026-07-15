import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { onReminderDue } from '../services/socket';

// Toca um som curto de alerta (Web Audio API, sem arquivos externos)
function playAlert() {
  try {
    const Ctx = (window.AudioContext || (window as any).webkitAudioContext);
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.type = 'sine';
    o.frequency.value = 880;
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
    o.start();
    o.stop(ctx.currentTime + 0.5);
  } catch {
    /* ignora se áudio não disponível */
  }
}

/**
 * Hook que escuta lembretes "vencidos" vindos do backend via Socket.IO.
 * Exibe notificação e toca som; clicar leva à conversa do contato.
 */
export function useReminders() {
  const navigate = useNavigate();

  useEffect(() => {
    const off = onReminderDue((e) => {
      playAlert();
      toast(
        (t) => (
          <div className="flex flex-col gap-1">
            <strong className="text-sm">⏰ Lembrete: {e.contactName}</strong>
            <span className="text-xs opacity-80">{e.description}{e.value ? ` — R$ ${e.value.toFixed(2)}` : ''}</span>
            <button
              className="mt-1 self-start text-xs font-semibold text-accent hover:underline"
              onClick={() => {
                toast.dismiss(t.id);
                navigate(`/chat/${e.contactId}`);
              }}
            >
              Abrir conversa →
            </button>
          </div>
        ),
        { duration: 10000, icon: '🔔' }
      );
    });
    return () => { off(); };
  }, [navigate]);
}
