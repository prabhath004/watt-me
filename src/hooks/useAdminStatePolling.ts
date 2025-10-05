import { useState, useEffect } from 'react';

const BASE = import.meta.env.VITE_SIM_BASE_URL ?? 'http://localhost:3001';
export const ADMIN_STATE_URL = `${BASE}/state/admin`;

export function useAdminStatePolling() {
  const [state, setState] = useState<any>(null);
  const [err, setErr] = useState<string | undefined>();

  useEffect(() => {
    let alive = true;
    
    const tick = async () => {
      try {
        const res = await fetch(ADMIN_STATE_URL, { cache: 'no-store' });
        if (!res.ok) throw new Error('admin state http ' + res.status);
        const json = await res.json();
        if (alive) setState(json);
        setErr(undefined);
      } catch (e: any) {
        console.warn('[poll] admin state failed', e);
        setErr(e?.message || 'poll failed');
      }
    };
    
    tick();
    const id = setInterval(tick, 2000);
    
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  return { state, err };
}
