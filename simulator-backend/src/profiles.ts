/**
 * Section 3: Profiles & Multipliers
 */

import type { SimulationEvent } from "./types.js";

// PV curve: bell-shaped, normalized [0..1], peaks at hour 12 (noon)
export const PV_CURVE = [
  0.0, 0.0, 0.0, 0.0, 0.0, 0.0,  // 0-5: night
  0.05, 0.15, 0.35, 0.60, 0.80, 0.95,  // 6-11: sunrise to noon
  1.0, 0.95, 0.80, 0.60, 0.35, 0.15,  // 12-17: noon to sunset
  0.05, 0.0, 0.0, 0.0, 0.0, 0.0   // 18-23: evening to night
];

// Load profile: low overnight, morning bump, evening peak
export const LOAD_PROFILE = [
  0.3, 0.25, 0.25, 0.25, 0.3, 0.35,  // 0-5: night (low)
  0.6, 0.8, 0.7, 0.5, 0.45, 0.4,     // 6-11: morning bump
  0.4, 0.4, 0.45, 0.5, 0.6, 0.75,    // 12-17: afternoon rise
  0.95, 1.0, 0.95, 0.85, 0.7, 0.5    // 18-23: evening peak
];

/**
 * Get weather multiplier based on active events
 */
export function weatherMultiplier(minuteOfDay: number, events: SimulationEvent[]): number {
  for (const event of events) {
    if (event.type === "CLOUDBURST" && 
        minuteOfDay >= event.start_minute && 
        minuteOfDay < event.end_minute) {
      return event.params?.pv_multiplier ?? 0.4;
    }
  }
  return 1.0;
}

/**
 * Get heatwave multiplier based on active events
 */
export function heatwaveMultiplier(minuteOfDay: number, events: SimulationEvent[]): number {
  for (const event of events) {
    if (event.type === "HEATWAVE" && 
        minuteOfDay >= event.start_minute && 
        minuteOfDay < event.end_minute) {
      return event.params?.load_multiplier ?? 1.15;
    }
  }
  return 1.0;
}

/**
 * Get EV surge extra demand (19:00-23:00)
 */
export function evSurgeKw(minuteOfDay: number, events: SimulationEvent[]): number {
  const hour = Math.floor(minuteOfDay / 60);
  
  for (const event of events) {
    if (event.type === "EV_SURGE" && 
        minuteOfDay >= event.start_minute && 
        minuteOfDay < event.end_minute &&
        hour >= 19 && hour <= 23) {
      return event.params?.ev_surge_kw ?? 3.0;
    }
  }
  return 0.0;
}

/**
 * Check if grid is available (not during outage)
 */
export function isGridAvailable(minuteOfDay: number, events: SimulationEvent[]): boolean {
  for (const event of events) {
    if (event.type === "OUTAGE" && 
        minuteOfDay >= event.start_minute && 
        minuteOfDay < event.end_minute) {
      return false;
    }
  }
  return true;
}

