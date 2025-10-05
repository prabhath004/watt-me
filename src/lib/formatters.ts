/**
 * Number formatting utilities - whole numbers only (no decimals)
 */

export function formatInt(value?: number): string {
  if (value === undefined || value === null) return '—';
  const rounded = Math.round(value);
  return rounded === 0 && value !== 0 && Math.abs(value) < 0.5 ? '0' : rounded.toString();
}

export function formatKw(value?: number): string {
  return formatInt(value);
}

export function formatKwh(value?: number): string {
  return formatInt(value);
}

export function formatPercent(value?: number): string {
  return formatInt(value);
}

export function formatCredits(value?: number): string {
  if (value === undefined || value === null) return '—';
  const rounded = Math.round(value);
  if (rounded === 0) return '0';
  return rounded > 0 ? `+${rounded}` : rounded.toString();
}

export function formatNumber(value?: number): number | undefined {
  if (value === undefined || value === null) return undefined;
  return Math.round(value);
}
