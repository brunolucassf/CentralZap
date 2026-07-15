// Indicador de status de conexão (verde/conectado, vermelho/desconectado,
// amarelo pulsante/QR, spinner/conectando)
export default function StatusDot({ status, size = 8 }: { status: string; size?: number }) {
  const color =
    status === 'connected'
      ? '#22c55e'
      : status === 'disconnected'
      ? '#ef4444'
      : status === 'qr'
      ? '#eab308'
      : '#a3a3a3';

  return (
    <span className="relative inline-flex" style={{ width: size, height: size }}>
      {status === 'qr' && (
        <span
          className="absolute inline-flex h-full w-full rounded-full animate-ping"
          style={{ background: color, opacity: 0.6 }}
        />
      )}
      {status === 'connecting' ? (
        <span
          className="inline-block h-full w-full rounded-full border-2 border-ink-600/40 border-t-accent animate-spin"
          style={{ width: size, height: size }}
        />
      ) : (
        <span
          className="relative inline-flex rounded-full"
          style={{ width: size, height: size, background: color }}
        />
      )}
    </span>
  );
}

export const STATUS_LABEL: Record<string, string> = {
  connected: 'Conectado',
  disconnected: 'Desconectado',
  qr: 'Aguardando QR',
  connecting: 'Conectando...',
};
