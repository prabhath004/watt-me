/**
 * Section 4: Core Tick Loop
 * Physics-based energy dispatch simulation
 */

import type { HomeState, MicrogridConfig, TickState } from "./types.js";
import { PV_CURVE, LOAD_PROFILE, weatherMultiplier, heatwaveMultiplier, evSurgeKw, isGridAvailable } from "./profiles.js";

const DT_HOURS = 1 / 60; // 1 minute = 1/60 hour
const ETA_CHARGE = 0.95;
const ETA_DISCHARGE = 0.95;
const EPSILON = 0.001;

export class MicrogridSimulator {
  private rng: () => number;
  
  constructor(seed: number = 42) {
    this.rng = seededRandom(seed);
  }

  /**
   * Run one tick of simulation
   */
  tick(homes: HomeState[], config: MicrogridConfig, timestamp: Date, minuteOfDay: number): TickState {
    const hour = Math.floor(minuteOfDay / 60);
    
    // Get event multipliers
    const weatherMult = weatherMultiplier(minuteOfDay, config.events);
    const heatwaveMult = heatwaveMultiplier(minuteOfDay, config.events);
    const evSurge = evSurgeKw(minuteOfDay, config.events);
    const gridAvailable = isGridAvailable(minuteOfDay, config.events);

    // Phase A-C: Per-home PV, Load, Battery
    const providers: { homeId: string; available_kwh: number }[] = [];
    const consumers: { homeId: string; need_kwh: number; critical: boolean }[] = [];

    for (const home of homes) {
      // A) PV & Load
      const noise = (this.rng() - 0.5) * 0.1; // ±5%
      home.pv_kw = Math.max(0, PV_CURVE[hour] * home.pv_size_kwp * weatherMult * (1 + noise));
      home.load_kw = Math.max(0, LOAD_PROFILE[hour] * home.household_scale * heatwaveMult * (1 + noise) + evSurge);

      // B) Self-use
      const self_use_kw = Math.min(home.pv_kw, home.load_kw);
      let rem_pv_kw = home.pv_kw - self_use_kw;
      let rem_load_kw = home.load_kw - self_use_kw;

      // Charge battery from excess PV
      home.charge_kw = 0;
      if (rem_pv_kw > EPSILON) {
        const target_soc = home.policy.day_soc_target_pct * home.battery_capacity_kwh;
        const room_kwh = Math.max(0, Math.min(
          target_soc - home.soc_kwh,
          home.max_charge_kw * DT_HOURS
        ));
        const charge_kwh = Math.min(rem_pv_kw * DT_HOURS, room_kwh) * ETA_CHARGE;
        home.soc_kwh = Math.min(home.battery_capacity_kwh, home.soc_kwh + charge_kwh);
        home.charge_kw = charge_kwh / DT_HOURS;
        rem_pv_kw -= home.charge_kw;
      }

      // C) Discharge battery for deficit
      home.discharge_kw = 0;
      if (rem_load_kw > EPSILON && home.policy.allow_discharge) {
        const reserve_kwh = home.reserve_floor_pct * home.battery_capacity_kwh;
        const available_kwh = Math.max(0, home.soc_kwh - reserve_kwh);
        const dis_kwh = Math.min(
          rem_load_kw * DT_HOURS,
          home.max_discharge_kw * DT_HOURS,
          available_kwh
        ) / ETA_DISCHARGE;
        home.soc_kwh = Math.max(0, home.soc_kwh - dis_kwh * ETA_DISCHARGE);
        home.discharge_kw = dis_kwh / DT_HOURS;
        rem_load_kw -= home.discharge_kw;
      }

      // D) Pool preparation
      if (rem_pv_kw > EPSILON) {
        providers.push({ homeId: home.id, available_kwh: rem_pv_kw * DT_HOURS });
      }
      if (rem_load_kw > EPSILON) {
        consumers.push({ 
          homeId: home.id, 
          need_kwh: rem_load_kw * DT_HOURS,
          critical: home.policy.critical
        });
      }
    }

    // E) Allocation Policy (equal-share)
    const allocations = this.allocatePool(providers, consumers, config.allocation);

    // F) Apply allocations and grid interaction
    let community_prod = 0;
    let community_mg_used = 0;
    let community_grid_imp = 0;
    let community_grid_exp = 0;
    let community_unserved = 0;

    for (const home of homes) {
      const alloc = allocations.get(home.id) || { share: 0, recv: 0 };
      home.share_kw = alloc.share / DT_HOURS;
      home.recv_kw = alloc.recv / DT_HOURS;
      
      // Calculate grid flows
      const surplus = (home.pv_kw - home.load_kw - home.charge_kw + home.discharge_kw - home.share_kw + home.recv_kw);
      
      if (surplus > EPSILON) {
        // Leftover goes to grid (export)
        home.grid_out_kw = gridAvailable ? surplus : 0;
        home.grid_in_kw = 0;
        if (!gridAvailable) {
          // Can't export during outage - waste it
        }
      } else if (surplus < -EPSILON) {
        // Need from grid (import)
        const need = -surplus;
        if (gridAvailable) {
          home.grid_in_kw = need;
          home.grid_out_kw = 0;
        } else {
          // Outage - unserved load
          home.grid_in_kw = 0;
          home.grid_out_kw = 0;
          community_unserved += need;
        }
      } else {
        home.grid_in_kw = 0;
        home.grid_out_kw = 0;
      }

      // Credits delta
      home.credits_delta_kwh = (home.share_kw - home.recv_kw) * DT_HOURS;
      home.credits_balance_kwh += home.credits_delta_kwh;

      // Community totals
      community_prod += home.pv_kw;
      community_mg_used += home.recv_kw;
      community_grid_imp += home.grid_in_kw;
      community_grid_exp += home.grid_out_kw;
    }

    return {
      timestamp,
      minute_of_day: minuteOfDay,
      homes,
      community_totals: {
        production_kw: community_prod,
        microgrid_used_kw: community_mg_used,
        grid_import_kw: community_grid_imp,
        grid_export_kw: community_grid_exp,
        unserved_kw: community_unserved
      }
    };
  }

  /**
   * Allocate community pool (equal-share policy)
   */
  private allocatePool(
    providers: { homeId: string; available_kwh: number }[],
    consumers: { homeId: string; need_kwh: number; critical: boolean }[],
    policy: string
  ): Map<string, { share: number; recv: number }> {
    const result = new Map<string, { share: number; recv: number }>();

    const POOL = providers.reduce((sum, p) => sum + p.available_kwh, 0);
    const TOTAL_NEED = consumers.reduce((sum, c) => sum + c.need_kwh, 0);

    if (POOL < EPSILON || TOTAL_NEED < EPSILON) {
      return result;
    }

    // Equal-share allocation
    const allocations: { homeId: string; alloc: number }[] = [];
    let total_allocated = 0;

    for (const consumer of consumers) {
      const alloc = Math.min(consumer.need_kwh, POOL * (consumer.need_kwh / TOTAL_NEED));
      allocations.push({ homeId: consumer.homeId, alloc });
      total_allocated += alloc;
    }

    // Scale down if needed due to float drift
    if (total_allocated > POOL) {
      const scale = POOL / total_allocated;
      allocations.forEach(a => a.alloc *= scale);
      total_allocated = POOL;
    }

    // Distribute to consumers
    for (const { homeId, alloc } of allocations) {
      result.set(homeId, { share: 0, recv: alloc });
    }

    // Distribute from providers (proportional to offer)
    for (const provider of providers) {
      const share = (provider.available_kwh / POOL) * total_allocated;
      const existing = result.get(provider.homeId) || { share: 0, recv: 0 };
      result.set(provider.homeId, { ...existing, share });
    }

    return result;
  }

  /**
   * Reset RNG with new seed
   */
  reset(seed: number): void {
    this.rng = seededRandom(seed);
  }
}

/**
 * Seeded random number generator (simple LCG)
 */
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

