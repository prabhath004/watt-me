/**
 * Flow Mapping Logic and Helpers
 * Business logic for energy flow calculations and visual mapping
 */

import { TOKENS, clamp, widthForKw, opacityForKw, FlowMode } from './tokens';

export interface FlowPoint {
  x: number;
  y: number;
}

export interface FlowPathData {
  from: FlowPoint;
  to: FlowPoint;
  kw: number;
  mode: FlowMode;
  dashed?: boolean;
  arrow?: boolean;
  opacity?: number;
  strokeWidth?: number;
}

export interface HouseAnchors {
  pvAnchor: FlowPoint;
  batteryAnchor: FlowPoint;
  homeAnchor: FlowPoint;
  gridAnchor: FlowPoint;
}

/**
 * Calculate energy flow paths based on home data
 */
export function calculateFlowPaths(
  pvKw: number,
  loadKw: number,
  socPct: number,
  gridImpKw: number,
  gridExpKw: number,
  shareKw: number,
  recvKw: number,
  anchors: HouseAnchors
): FlowPathData[] {
  const flows: FlowPathData[] = [];

  // PV -> Battery (solar generation)
  if (pvKw > 0) {
    flows.push({
      from: anchors.pvAnchor,
      to: anchors.batteryAnchor,
      kw: pvKw,
      mode: 'solar',
      opacity: opacityForKw(pvKw),
      strokeWidth: widthForKw(pvKw),
    });
  }

  // Battery -> Home (residual load served by battery)
  const batteryLoad = Math.max(0, loadKw - pvKw);
  if (batteryLoad > 0) {
    flows.push({
      from: anchors.batteryAnchor,
      to: anchors.homeAnchor,
      kw: batteryLoad,
      mode: 'battery',
      opacity: opacityForKw(batteryLoad),
      strokeWidth: widthForKw(batteryLoad),
    });
  }

  // PV -> Home (direct solar to load)
  const directSolar = Math.min(loadKw, pvKw);
  if (directSolar > 0) {
    flows.push({
      from: anchors.pvAnchor,
      to: anchors.homeAnchor,
      kw: directSolar * 0.35, // Faint line
      mode: 'solar',
      opacity: 0.35,
      strokeWidth: 1.5,
    });
  }

  // Home -> Grid (export)
  if (gridExpKw > 0) {
    flows.push({
      from: anchors.homeAnchor,
      to: anchors.gridAnchor,
      kw: gridExpKw,
      mode: 'export',
      dashed: true,
      arrow: true,
      opacity: opacityForKw(gridExpKw),
      strokeWidth: widthForKw(gridExpKw),
    });
  }

  // Grid -> Home (import)
  if (gridImpKw > 0) {
    flows.push({
      from: anchors.gridAnchor,
      to: anchors.homeAnchor,
      kw: gridImpKw,
      mode: 'import',
      dashed: true,
      arrow: true,
      opacity: opacityForKw(gridImpKw),
      strokeWidth: widthForKw(gridImpKw),
    });
  }

  // Community sharing flows (if needed)
  if (shareKw > 0) {
    flows.push({
      from: anchors.homeAnchor,
      to: { x: anchors.homeAnchor.x + 100, y: anchors.homeAnchor.y - 50 },
      kw: shareKw,
      mode: 'export',
      dashed: true,
      opacity: opacityForKw(shareKw),
      strokeWidth: widthForKw(shareKw),
    });
  }

  if (recvKw > 0) {
    flows.push({
      from: { x: anchors.homeAnchor.x + 100, y: anchors.homeAnchor.y - 50 },
      to: anchors.homeAnchor,
      kw: recvKw,
      mode: 'import',
      dashed: true,
      opacity: opacityForKw(recvKw),
      strokeWidth: widthForKw(recvKw),
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
export function getFlowColor(mode: FlowMode): string {
  switch (mode) {
    case 'solar':
      return TOKENS.solar;
    case 'battery':
      return TOKENS.purple;
    case 'export':
      return TOKENS.teal;
    case 'import':
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
    pvAnchor: { x: centerX + 60, y: centerY - 80 },      // Top-right of roof
    batteryAnchor: { x: centerX + 40, y: centerY + 20 },  // Right side of house
    homeAnchor: { x: centerX, y: centerY + 40 },          // Center of house
    gridAnchor: { x: centerX + 120, y: centerY + 20 },    // Right side, grid connection
  };
}
