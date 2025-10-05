/**
 * Safe home data selector with defaults
 */

import { useMemo } from 'react';
import { normalizeHomeId, EMPTY_NOW, type SafeHomeData } from '@/lib/homeUtils';

// Mock store interface - replace with actual store
interface HomeRecord {
  id: string;
  name: string;
  member: boolean;
  now: {
    pv_kw: number;
    load_kw: number;
    share_kw: number;
    recv_kw: number;
    grid_in_kw: number;
    grid_out_kw: number;
    soc_pct: number;
    credits_kwh: number;
  };
  meta: {
    pv_size_kwp: number;
    capacity_kwh: number;
  };
}

// Mock homes data - replace with actual store
const mockHomes: Record<string, HomeRecord> = {};

export function useHomeSafe(idRaw: string | number, homes: any[] = []): SafeHomeData {
  const id = normalizeHomeId(idRaw);
  
  // Find home in the provided homes array
  const homeRecord = useMemo(() => {
    return homes.find(home => normalizeHomeId(home.id) === id);
  }, [homes, id]);
  
  // Safe data extraction with defaults
  const safeData: SafeHomeData = useMemo(() => {
    if (!homeRecord) {
      return {
        id,
        member: true, // Default to member
        name: id,
        now: EMPTY_NOW,
        meta: {
          pv_size_kwp: 0,
          capacity_kwh: 0
        }
      };
    }
    
    return {
      id,
      member: true, // All homes in simulation are members
      name: homeRecord.id || id,
      now: {
        pv_kw: homeRecord.pv || 0,
        load_kw: homeRecord.load || 0,
        share_kw: homeRecord.share || 0,
        recv_kw: homeRecord.recv || 0,
        grid_in_kw: homeRecord.imp || 0,
        grid_out_kw: homeRecord.exp || 0,
        soc_pct: homeRecord.soc || 0,
        credits_kwh: homeRecord.credits_balance_kwh || 0
      },
      meta: {
        pv_size_kwp: 5, // Default 5kW system
        capacity_kwh: 10 // Default 10kWh battery
      }
    };
  }, [id, homeRecord]);
  
  return safeData;
}
