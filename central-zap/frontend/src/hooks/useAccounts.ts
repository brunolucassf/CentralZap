import { useEffect, useState } from 'react';
import api from '../services/api';
import { onAccountStatus, onAccountQr } from '../services/socket';

export interface Account {
  id: string;
  name: string;
  phone: string | null;
  status: string; // connected | disconnected | qr | connecting
  liveStatus: string;
  color: string;
  dndEnabled: boolean;
  dndUntil: string | null;
}

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const { data } = await api.get('/accounts');
      setAccounts(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const offStatus = onAccountStatus((e) => {
      setAccounts((prev) =>
        prev.map((a) => (a.id === e.accountId ? { ...a, status: e.status, liveStatus: e.status, phone: e.phone ?? a.phone } : a))
      );
    });
    const offQr = onAccountQr((e) => {
      setAccounts((prev) =>
        prev.map((a) => (a.id === e.accountId ? { ...a, status: 'qr', liveStatus: 'qr' } : a))
      );
    });
    return () => {
      offStatus();
      offQr();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { accounts, loading, reload: load, setAccounts };
}
