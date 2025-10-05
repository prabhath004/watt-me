/**
 * Flow Mapping Logic and Helpers
 * Business logic for energy flow calculations and visual mapping
 */

import { TOKENS, clamp } from './tokens';

export interface FlowPoint {
  x: number;
  y: number;
}

export interface FlowPathData {
  from: FlowPoint;
  to: FlowPoint;
  kw: number;
  mode: "pv" | "battery" | "export" | "import";
  dashed?: boolean;
  arrow?: boolean;
  title?: string;
}

export interface HouseAnchors {
  pvAnchor: FlowPoint;
  batteryAnchor: FlowPoint;
  homeAnchor: FlowPoint;
  gridAnchor: FlowPoint;
}

// Utility functions
export const widthForKw = (kw: number): number => 
  clamp(kw * 0.8, 1.5, 6);

export const opacityForKw = (kw: number): number => 
  kw > 0 ? 1 : 0.25;

// Number formatting (memoized)
const kwFormatter = new Intl.NumberFormat('en-US', { 
  minimumFractionDigits: 1, 
  maximumFractionDigits: 1 
});

const percentFormatter = new Intl.NumberFormat('en-US', { 
  minimumFractionDigits: 0, 
  maximumFractionDigits: 0 
});

export const formatKw = (value: number): string => kwFormatter.format(value);
export const formatPercent = (value: number): string => percentFormatter.format(value);

/**
 * Calculate energy flow paths based on home data
 */
export function calculateFlowPaths(
  pvKw: number,
  loadKw: number,
  socPct: number,
  impKw: number,
  expKw: number,
  shareKw: number,
  recvKw: number,
  anchors: HouseAnchors
): FlowPathData[] {
  const flows: FlowPathData[] = [];

  // PV -> Battery (main solar generation)
  if (pvKw > 0) {
    flows.push({
      from: anchors.pvAnchor,
      to: anchors.batteryAnchor,
      kw: pvKw,
      mode: "pv",
      title: "Solar Generation",
    });
  }

  // Battery -> Home (residual load served by battery)
  const batteryLoad = Math.max(0, loadKw - pvKw);
  if (batteryLoad > 0) {
    flows.push({
      from: anchors.batteryAnchor,
      to: anchors.homeAnchor,
      kw: batteryLoad,
      mode: "battery",
      title: "Battery Discharge",
    });
  }

  // PV -> Home (direct solar to load - faint line)
  const directSolar = Math.min(loadKw, pvKw);
  if (directSolar > 0) {
    flows.push({
      from: anchors.pvAnchor,
      to: anchors.homeAnchor,
      kw: directSolar * 0.35, // Faint line
      mode: "pv",
      title: "Direct Solar",
    });
  }

  // Home -> Grid (export)
  if (expKw > 0) {
    flows.push({
      from: anchors.homeAnchor,
      to: anchors.gridAnchor,
      kw: expKw,
      mode: "export",
      dashed: true,
      arrow: true,
      title: "Grid Export",
    });
  }

  // Grid -> Home (import)
  if (impKw > 0) {
    flows.push({
      from: anchors.gridAnchor,
      to: anchors.homeAnchor,
      kw: impKw,
      mode: "import",
      dashed: true,
      arrow: true,
      title: "Grid Import",
    });
  }

  // If both import and export are 0, show faint PV/Battery lines
  if (impKw === 0 && expKw === 0) {
    flows.forEach(flow => {
      if (flow.mode === "pv" || flow.mode === "battery") {
        flow.kw = flow.kw * 0.35;
      }
    });
  }

  return flows;
}

/**
 * Generate cubic Bézier curve path between two points
 */
export function generateCurvePath(from: FlowPoint, to: FlowPoint): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Control point offset based on distance
  const offset = Math.min(distance * 0.3, 50);
  
  // Auto-flip control points when from.x > to.x
  const controlOffsetX = from.x > to.x ? -offset : offset;
  
  const cp1x = from.x + controlOffsetX;
  const cp1y = from.y - offset * 0.5;
  const cp2x = to.x - controlOffsetX;
  const cp2y = to.y + offset * 0.5;
  
  return `M ${from.x} ${from.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${to.x} ${to.y}`;
}

/**
 * Get flow color based on mode
 */
export function getFlowColor(mode: "pv" | "battery" | "export" | "import"): string {
  switch (mode) {
    case "pv":
      return TOKENS.solar;
    case "battery":
      return TOKENS.purple;
    case "export":
      return TOKENS.teal;
    case "import":
      return TOKENS.red;
    default:
      return TOKENS.muted;
  }
}

/**
 * Calculate house anchor points for SVG positioning
 */
export function calculateHouseAnchors(svgWidth: number, svgHeight: number): HouseAnchors {
  const centerX = svgWidth / 2;
  const centerY = svgHeight / 2;
  
  return {
    pvAnchor: { x: centerX + 80, y: centerY - 100 },      // Top-right of roof
    batteryAnchor: { x: centerX + 60, y: centerY + 20 },  // Right side of house
    homeAnchor: { x: centerX + 20, y: centerY + 40 },     // Right wall outlet
    gridAnchor: { x: centerX + 140, y: centerY + 20 },    // Outside right
  };
}
