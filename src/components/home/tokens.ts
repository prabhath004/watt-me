/**
 * Tesla-Style Design Tokens (Light Theme)
 * Production-grade color palette and design system
 */

export const TOKENS = {
  // Base colors
  bg: "#F7F8FB",
  surface: "#FFFFFF", 
  ink: "#0B1220",
  muted: "#6B7280",
  border: "#E5E7EB",
  
  // Shadows and effects
  shadow: "0 10px 30px rgba(15,23,42,.06)",
  radius: 22,
  
  // Accent colors
  blue: "#0A84FF",     // primary / links
  teal: "#06B6D4",     // export
  red: "#EF4444",      // import
  green: "#16A34A",    // sharing / good
  amber: "#F59E0B",    // reserve / warn
  purple: "#7C3AED",   // battery / SOC
  solar: "#FBBF24",    // solar label/icon
  
  // Gradients
  gradients: {
    wall: "linear-gradient(180deg, #FFFFFF 0%, #EEF2F7 100%)",
    roof: "linear-gradient(135deg, #E2E8F0 0%, #CBD5E1 100%)",
    panel: "linear-gradient(135deg, #1F2937 0%, #0EA5E9 100%)",
    solar: "linear-gradient(90deg, #FBBF24 0%, #0A84FF 100%)",
    battery: "linear-gradient(90deg, #7C3AED 0%, #16A34A 100%)",
  },
} as const;

export const TYPE = {
  value: "text-[28px] md:text-[36px] font-bold tracking-tight",
  label: "text-xs font-medium",
  caption: "text-[11px]",
};

// Utility functions
export const clamp = (value: number, min: number, max: number): number => 
  Math.min(max, Math.max(min, value));

export const widthForKw = (kw: number): number => 
  clamp(kw * 0.8, 1.5, 6);

export const opacityForKw = (kw: number): number => 
  kw > 0 ? 1 : 0.25;

export const isExporting = (expKw: number): boolean => expKw > 0;
export const isImporting = (impKw: number): boolean => impKw > 0;

// Number formatting
export const formatKw = (value: number): string => 
  new Intl.NumberFormat('en-US', { 
    minimumFractionDigits: 1, 
    maximumFractionDigits: 1 
  }).format(value);

export const formatPercent = (value: number): string => 
  new Intl.NumberFormat('en-US', { 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 0 
  }).format(value);

// Color helpers
export const getSocColor = (soc: number): string => {
  if (soc < 20) return TOKENS.red;
  if (soc < 60) return TOKENS.amber;
  return TOKENS.green;
};

export const getFlowModeColor = (mode: FlowMode): string => {
  switch (mode) {
    case 'solar': return TOKENS.solar;
    case 'battery': return TOKENS.purple;
    case 'export': return TOKENS.teal;
    case 'import': return TOKENS.red;
    default: return TOKENS.muted;
  }
};

export type FlowMode = 'solar' | 'battery' | 'export' | 'import';

export type StatPillTone = 'neutral' | 'solar' | 'grid' | 'battery' | 'good' | 'bad';
