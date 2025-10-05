/**
 * Safe number formatting utilities to prevent crashes
 */

// Safe integer formatting
export const int = (x: number | undefined | null): number => 
  Math.round(Number.isFinite(x as any) ? (x as number) : 0);

// Safe decimal formatting
export const decimal = (x: number | undefined | null, places: number = 1): number => {
  const num = Number.isFinite(x as any) ? (x as number) : 0;
  return Math.round(num * Math.pow(10, places)) / Math.pow(10, places);
};

// Safe percentage formatting
export const percent = (x: number | undefined | null): number => 
  Math.round(Number.isFinite(x as any) ? (x as number) : 0);

// Safe currency formatting
export const currency = (x: number | undefined | null): number => 
  Math.round(Number.isFinite(x as any) ? (x as number) : 0);
