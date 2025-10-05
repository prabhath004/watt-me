/**
 * Data loading and parsing utilities for community energy data
 */

import type {
  TimeseriesRow,
  HomeMetadata,
  CommunityData,
  CommunityTotals,
  HourlyTrend,
  HomeSnapshot,
  RoutingPair,
} from "@/types/community";

/**
 * Parse CSV text into array of objects
 */
function parseCSV<T>(csvText: string): T[] {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim());
  const rows: T[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",");
    const row: any = {};

    headers.forEach((header, index) => {
      const value = values[index]?.trim() || "";

      // Type coercion
      if (value === "true" || value === "True") {
        row[header] = true;
      } else if (value === "false" || value === "False") {
        row[header] = false;
      } else if (!isNaN(Number(value)) && value !== "") {
        row[header] = Number(value);
      } else {
        row[header] = value;
      }
    });

    rows.push(row);
  }

  return rows;
}

/**
 * Load and parse community data from CSV files
 */
export async function loadCommunityData(): Promise<CommunityData> {
  try {
    // Fetch both CSV files
    const [timeseriesResponse, metadataResponse] = await Promise.all([
      fetch("/data/community_timeseries.csv"),
      fetch("/data/community_metadata.csv"),
    ]);

    if (!timeseriesResponse.ok || !metadataResponse.ok) {
      throw new Error("Failed to fetch community data");
    }

    const [timeseriesText, metadataText] = await Promise.all([
      timeseriesResponse.text(),
      metadataResponse.text(),
    ]);

    // Parse CSVs
    const timeseries = parseCSV<TimeseriesRow>(timeseriesText);
    const metadata = parseCSV<HomeMetadata>(metadataText);

    // Sort timeseries by timestamp and home_id
    timeseries.sort((a, b) => {
      const timeComp = a.timestamp_hour.localeCompare(b.timestamp_hour);
      if (timeComp !== 0) return timeComp;
      return a.home_id.localeCompare(b.home_id);
    });

    // Extract unique hours
    const hoursSet = new Set<string>();
    timeseries.forEach((row) => hoursSet.add(row.timestamp_hour));
    const unique_hours = Array.from(hoursSet).sort();

    // Group by hour
    const hour_groups = new Map<string, TimeseriesRow[]>();
    timeseries.forEach((row) => {
      const hour = row.timestamp_hour;
      if (!hour_groups.has(hour)) {
        hour_groups.set(hour, []);
      }
      hour_groups.get(hour)!.push(row);
    });

    // Get last row per home
    const last_row_per_home = new Map<string, TimeseriesRow>();
    const homeIds = new Set(timeseries.map((r) => r.home_id));
    homeIds.forEach((homeId) => {
      const homeRows = timeseries.filter((r) => r.home_id === homeId);
      if (homeRows.length > 0) {
        last_row_per_home.set(homeId, homeRows[homeRows.length - 1]);
      }
    });

    return {
      timeseries,
      metadata,
      unique_hours,
      hour_groups,
      last_row_per_home,
    };
  } catch (error) {
    console.error("Error loading community data:", error);
    throw error;
  }
}

/**
 * Compute community-wide totals
 */
export function computeCommunityTotals(
  timeseries: TimeseriesRow[]
): CommunityTotals {
  let production_kwh = 0;
  let microgrid_used_kwh = 0;
  let grid_import_kwh = 0;
  let self_consumption_kwh = 0;

  timeseries.forEach((row) => {
    production_kwh += row.pv_production_kwh;
    microgrid_used_kwh += row.from_pool_kwh;
    grid_import_kwh += row.grid_import_kwh;

    // Self-consumption = min(PV, Load) for each hour
    const direct_use = Math.min(row.pv_production_kwh, row.load_consumption_kwh);
    self_consumption_kwh += direct_use;
  });

  return {
    production_kwh: Number(production_kwh.toFixed(1)),
    microgrid_used_kwh: Number(microgrid_used_kwh.toFixed(1)),
    grid_import_kwh: Number(grid_import_kwh.toFixed(1)),
    self_consumption_kwh: Number(self_consumption_kwh.toFixed(1)),
  };
}

/**
 * Compute hourly trends for charts
 */
export function computeHourlyTrends(
  hour_groups: Map<string, TimeseriesRow[]>
): HourlyTrend[] {
  const trends: HourlyTrend[] = [];

  const sortedHours = Array.from(hour_groups.keys()).sort();

  sortedHours.forEach((hour) => {
    const rows = hour_groups.get(hour) || [];

    let production_kwh = 0;
    let microgrid_used_kwh = 0;
    let grid_import_kwh = 0;
    let total_pv = 0;
    let total_direct_use = 0;

    rows.forEach((row) => {
      production_kwh += row.pv_production_kwh;
      microgrid_used_kwh += row.from_pool_kwh;
      grid_import_kwh += row.grid_import_kwh;

      total_pv += row.pv_production_kwh;
      total_direct_use += Math.min(
        row.pv_production_kwh,
        row.load_consumption_kwh
      );
    });

    const self_consumption_ratio =
      total_pv > 0 ? total_direct_use / total_pv : 0;

    trends.push({
      timestamp_hour: hour,
      production_kwh: Number(production_kwh.toFixed(2)),
      microgrid_used_kwh: Number(microgrid_used_kwh.toFixed(2)),
      grid_import_kwh: Number(grid_import_kwh.toFixed(2)),
      self_consumption_ratio: Number(self_consumption_ratio.toFixed(3)),
    });
  });

  return trends;
}

/**
 * Compute per-home snapshots
 */
export function computeHomeSnapshots(
  last_row_per_home: Map<string, TimeseriesRow>,
  timeseries: TimeseriesRow[]
): HomeSnapshot[] {
  const snapshots: HomeSnapshot[] = [];

  last_row_per_home.forEach((lastRow, homeId) => {
    // Calculate net for the entire period
    const homeRows = timeseries.filter((r) => r.home_id === homeId);
    const net_period_kwh = homeRows.reduce(
      (sum, row) => sum + row.credits_delta_kwh,
      0
    );

    snapshots.push({
      home_id: homeId,
      battery_soc_pct: Number(lastRow.battery_soc_pct.toFixed(1)),
      credits_balance_kwh: Number(lastRow.credits_balance_kwh.toFixed(2)),
      net_period_kwh: Number(net_period_kwh.toFixed(2)),
      solar_capacity_kw: lastRow.solar_capacity_kw,
      battery_capacity_kwh: lastRow.battery_capacity_kwh,
    });
  });

  // Sort by credits balance (descending)
  snapshots.sort((a, b) => b.credits_balance_kwh - a.credits_balance_kwh);

  return snapshots;
}

/**
 * Compute routing pairs for a specific hour (greedy allocation)
 */
export function computeRoutingPairs(hourRows: TimeseriesRow[]): RoutingPair[] {
  if (!hourRows || hourRows.length === 0) return [];

  // Separate producers and consumers
  const producers = hourRows
    .filter((row) => row.to_pool_kwh > 0.001)
    .map((row) => ({
      home_id: row.home_id,
      available: row.to_pool_kwh,
    }))
    .sort((a, b) => b.available - a.available);

  const consumers = hourRows
    .filter((row) => row.from_pool_kwh > 0.001)
    .map((row) => ({
      home_id: row.home_id,
      needed: row.from_pool_kwh,
    }))
    .sort((a, b) => b.needed - a.needed);

  if (producers.length === 0 || consumers.length === 0) {
    return [];
  }

  const pairs: RoutingPair[] = [];
  let producerIdx = 0;
  let consumerIdx = 0;
  let producerRemaining = producers[producerIdx].available;
  let consumerNeeded = consumers[consumerIdx].needed;

  while (producerIdx < producers.length && consumerIdx < consumers.length) {
    const allocated = Math.min(producerRemaining, consumerNeeded);

    if (allocated > 0.001) {
      pairs.push({
        from_home: producers[producerIdx].home_id,
        to_home: consumers[consumerIdx].home_id,
        kwh: Number(allocated.toFixed(3)),
      });
    }

    producerRemaining -= allocated;
    consumerNeeded -= allocated;

    // Move to next producer or consumer
    if (producerRemaining < 0.001) {
      producerIdx++;
      if (producerIdx < producers.length) {
        producerRemaining = producers[producerIdx].available;
      }
    }

    if (consumerNeeded < 0.001) {
      consumerIdx++;
      if (consumerIdx < consumers.length) {
        consumerNeeded = consumers[consumerIdx].needed;
      }
    }
  }

  return pairs;
}

/**
 * Find the default hour index (first hour with non-zero microgrid activity)
 */
export function findDefaultHourIndex(
  hour_groups: Map<string, TimeseriesRow[]>
): number {
  const sortedHours = Array.from(hour_groups.keys()).sort();

  for (let i = 0; i < sortedHours.length; i++) {
    const rows = hour_groups.get(sortedHours[i]) || [];
    const hasMicrogridActivity = rows.some(
      (row) => row.to_pool_kwh > 0.001 || row.from_pool_kwh > 0.001
    );

    if (hasMicrogridActivity) {
      return i;
    }
  }

  return 0; // Default to first hour if no activity found
}

