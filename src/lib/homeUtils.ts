/**
 * Home ID normalization and safe data handling utilities
 */

// Normalize home IDs to prevent H3 vs H003 bugs
export function normalizeHomeId(raw: string | number): string {
  const s = String(raw).replace(/[^\d]/g, ''); // keep digits only
  return `H${s.padStart(3, '0')}`;            // H001..H999
}

// Safe home data type
export type HomeNow = {
  pv_kw: number;
  load_kw: number;
  share_kw: number;
  recv_kw: number;
  grid_in_kw: number;
  grid_out_kw: number;
  soc_pct: number;
  credits_kwh: number;
};

// Empty home data for safe defaults
export const EMPTY_NOW: HomeNow = {
  pv_kw: 0,
  load_kw: 0,
  share_kw: 0,
  recv_kw: 0,
  grid_in_kw: 0,
  grid_out_kw: 0,
  soc_pct: 0,
  credits_kwh: 0
};

// Safe home data with defaults
export type SafeHomeData = {
  id: string;
  member: boolean;
  name: string;
  now: HomeNow;
  meta: {
    pv_size_kwp: number;
    capacity_kwh: number;
  };
};

// Safe rounding helper
export const r = (x: number) => Math.round(x ?? 0);

// Validate map bindings
export function validateMapBindings(markerIds: string[], storeIds: string[]) {
  const missInStore = markerIds.filter(id => !storeIds.includes(id));
  const missOnMap = storeIds.filter(id => !markerIds.includes(id));
  
  if (missInStore.length) {
    console.warn('[Map] Markers missing in store:', missInStore);
  }
  if (missOnMap.length) {
    console.warn('[Map] Store homes not on map:', missOnMap);
  }
  
  const allGood = missInStore.length === 0 && missOnMap.length === 0;
  if (allGood) {
    console.log('[Map] All markers properly bound to store data');
  }
  
  return { missInStore, missOnMap, allGood };
}
