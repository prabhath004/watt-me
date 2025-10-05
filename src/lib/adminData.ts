/**
 * Admin Data Normalization - Schema compatibility shim
 */

// Unified base URL configuration
const BASE = import.meta.env.VITE_SIM_BASE_URL ?? 'http://localhost:3001';
export const STREAM_URL = `${BASE}/stream`;
export const ADMIN_URL = `${BASE}/state/admin`;

export type AdminNow = {
  production_kw: number;
  consumption_kw: number;
  microgrid_shared_kw: number;
  grid_import_kw: number;
  grid_export_kw: number;
  avg_battery_soc_pct: number;
};

export function normalizeAdminDelta(anyPayload: any): {
  now: AdminNow;
  point?: {
    ts: number;
    production_kw: number;
    consumption_kw: number;
    microgrid_shared_kw: number;
    grid_import_kw: number;
    grid_export_kw: number;
  };
} {
  // Accept both snake_case and camelCase; accept nested 'community_now' or flat
  const src = anyPayload.community_now ?? anyPayload.now ?? anyPayload;

  const pick = (a: any, keys: string[], fallback = 0) =>
    keys.reduce((v, k) => v ?? a?.[k], undefined) ?? fallback;

  // Handle different data structures from backend
  const community = src.community || src;
  const grid = src.grid || {};
  const homes = src.homes || [];

  const now: AdminNow = {
    production_kw: pick(community, ['production_kw', 'production', 'prodKw', 'prod']),
    consumption_kw: pick(community, ['consumption_kw', 'consumption', 'loadKw']),
    microgrid_shared_kw: pick(community, ['microgrid_shared_kw', 'shared_kw', 'mgShared', 'mg_used']),
    grid_import_kw: pick(grid, ['grid_import_kw', 'import_kw', 'gridIn', 'imp']),
    grid_export_kw: pick(grid, ['grid_export_kw', 'export_kw', 'gridOut', 'exp']),
    avg_battery_soc_pct: homes.length > 0 
      ? homes.reduce((sum: number, h: any) => sum + (h.soc || 0), 0) / homes.length
      : 0
  };

  // Timeline point (accept nested timeline payloads too)
  const ts = pick(anyPayload, ['ts', 'timestamp', 'timeMs'], Date.now());
  const point = {
    ts: typeof ts === 'string' ? new Date(ts).getTime() : ts,
    production_kw: now.production_kw,
    consumption_kw: now.consumption_kw,
    microgrid_shared_kw: now.microgrid_shared_kw,
    grid_import_kw: now.grid_import_kw,
    grid_export_kw: now.grid_export_kw
  };

  return { now, point };
}

// SSE connection with verbose logging and backoff
let backoffMs = 1000;

export function connectSSE(onMsg: (p: any) => void): EventSource {
  console.info('[SSE] connecting to', STREAM_URL);
  const es = new EventSource(STREAM_URL, { withCredentials: false });

  es.onmessage = (e) => {
    try {
      const payload = JSON.parse(e.data);
      console.debug('[SSE] message', payload);
      onMsg(payload);
      backoffMs = 1000; // reset
    } catch (err) {
      console.error('[SSE] parse error', err, e.data);
    }
  };

  es.onerror = () => {
    console.warn('[SSE] error — reconnecting in', backoffMs, 'ms');
    es.close();
    setTimeout(() => {
      backoffMs = Math.min(backoffMs * 2, 15000);
      connectSSE(onMsg);
    }, backoffMs);
  };

  return es;
}

// Polling fallback
let lastSseTs = Date.now();

export function startPollingFallback(onMsg: (p: any) => void) {
  setInterval(async () => {
    const stale = Date.now() - lastSseTs > 5000;
    if (!stale) return;
    try {
      const res = await fetch(ADMIN_URL, { cache: 'no-store' });
      const json = await res.json();
      const { now, point } = normalizeAdminDelta(json);
      onMsg({ now, point });
      console.debug('[POLL] admin state updated');
    } catch (e) {
      console.warn('[POLL] failed', e);
    }
  }, 2000);
}

export function updateLastSseTs() {
  lastSseTs = Date.now();
}
