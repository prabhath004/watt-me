/**
 * Type definitions for community energy data
 */

export interface TimeseriesRow {
  timestamp_hour: string;
  home_id: string;
  solar_capacity_kw: number;
  battery_capacity_kwh: number;
  pv_production_kwh: number;
  load_consumption_kwh: number;
  from_pool_cap_kwh: number;
  battery_soc_pct: number;
  battery_flow_kwh: number;
  to_pool_kwh: number;
  from_pool_kwh: number;
  grid_import_kwh: number;
  credits_delta_kwh: number;
  credits_balance_kwh: number;
  policy_mode: string;
}

export interface HomeMetadata {
  home_id: string;
  solar_capacity_kw: number;
  battery_capacity_kwh: number;
  load_base_kwh: number;
  load_peak_kwh: number;
  solar_orientation: string;
  load_pattern_shift_hours: number;
  is_net_consumer: boolean;
}

export interface CommunityTotals {
  production_kwh: number;
  microgrid_used_kwh: number;
  grid_import_kwh: number;
  self_consumption_kwh: number;
}

export interface HourlyTrend {
  timestamp_hour: string;
  production_kwh: number;
  microgrid_used_kwh: number;
  grid_import_kwh: number;
  self_consumption_ratio: number;
}

export interface HomeSnapshot {
  home_id: string;
  battery_soc_pct: number;
  credits_balance_kwh: number;
  net_period_kwh: number;
  solar_capacity_kw: number;
  battery_capacity_kwh: number;
}

export interface RoutingPair {
  from_home: string;
  to_home: string;
  kwh: number;
}

export interface CommunityData {
  timeseries: TimeseriesRow[];
  metadata: HomeMetadata[];
  unique_hours: string[];
  hour_groups: Map<string, TimeseriesRow[]>;
  last_row_per_home: Map<string, TimeseriesRow>;
}

