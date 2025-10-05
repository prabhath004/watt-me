/**
 * Type definitions for microgrid simulator
 */

export type SimMode = "realtime" | "accelerated";
export type AllocationPolicy = "equal" | "need" | "cap";

export interface HomeState {
  id: string;
  pv_size_kwp: number;
  household_scale: number;
  battery_capacity_kwh: number;
  soc_kwh: number;
  max_charge_kw: number;
  max_discharge_kw: number;
  reserve_floor_pct: number;
  policy: {
    allow_discharge: boolean;
    day_soc_target_pct: number;
    critical: boolean;
  };
  credits_balance_kwh: number;
  
  // Per-tick derived (ephemeral)
  pv_kw: number;
  load_kw: number;
  charge_kw: number;
  discharge_kw: number;
  share_kw: number;
  recv_kw: number;
  grid_in_kw: number;
  grid_out_kw: number;
  credits_delta_kwh: number;
}

export interface MicrogridConfig {
  fair_rate_cents_per_kwh: number;
  import_price_cents: number;
  export_price_cents: number;
  allocation: AllocationPolicy;
  events: SimulationEvent[];
}

export interface SimulationEvent {
  type: "OUTAGE" | "CLOUDBURST" | "HEATWAVE" | "EV_SURGE";
  start_minute: number;
  end_minute: number;
  params?: {
    pv_multiplier?: number;
    load_multiplier?: number;
    ev_surge_kw?: number;
  };
}

export interface TickState {
  timestamp: Date;
  minute_of_day: number;
  homes: HomeState[];
  community_totals: {
    production_kw: number;
    microgrid_used_kw: number;
    grid_import_kw: number;
    grid_export_kw: number;
    unserved_kw: number;
  };
}

export interface DailyRollup {
  date: string;
  production_kwh: number;
  microgrid_used_kwh: number;
  grid_import_kwh: number;
  grid_export_kwh: number;
  unserved_kwh: number;
  homes: {
    id: string;
    produced_kwh: number;
    consumed_kwh: number;
    shared_kwh: number;
    received_kwh: number;
    credits_net_kwh: number;
  }[];
}

export interface AdminStateResponse {
  last_update_ts: string;
  grid: {
    to_grid_kw: number;
    from_grid_kw: number;
    to_grid_today_kwh: number;
    from_grid_today_kwh: number;
    top_exporters: { home: string; kw: number }[];
    drawing_now: { home: string; kw: number }[];
  };
  community_today: {
    production_kwh: number;
    microgrid_used_kwh: number;
    grid_import_kwh: number;
    grid_export_kwh: number;
    unserved_kwh: number;
  };
  fair_rate_cents_per_kwh: number;
  homes: {
    id: string;
    pv_kw: number;
    usage_kw: number;
    sharing_kw: number;
    receiving_kw: number;
    soc_pct: number;
    credits_net_kwh_mtd: number;
  }[];
}

export interface UserStateResponse {
  energy_summary: {
    solar_kw: number;
    consumed_kw: number;
    surplus_today_kwh: number;
  };
  battery: {
    soc_pct: number;
    charged_today_kwh: number;
    discharged_today_kwh: number;
  };
  sharing: {
    sharing_now_kw: number;
    receiving_now_kw: number;
    peers?: string[];
  };
  credits: {
    mtd_net_kwh: number;
    earned_today_kwh: number;
    used_today_kwh: number;
  };
  chart_today: {
    solar_kw: number[];
    consumption_kw: number[];
    to_grid_kw: number[];
  };
}

export interface SSEDelta {
  ts: string;
  homes: {
    id: string;
    pv: number;
    load: number;
    soc: number;
    share: number;
    recv: number;
    imp: number;
    exp: number;
    creditsDelta: number;
  }[];
  grid: {
    imp: number;
    exp: number;
  };
  community: {
    prod: number;
    mg_used: number;
    unserved: number;
  };
}

