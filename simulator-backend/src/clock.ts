/**
 * Virtual Clock - Manages simulated time
 */

import type { SimMode } from "./types.js";

export class VirtualClock {
  private currentTime: Date;
  private mode: SimMode;
  private tickInterval: NodeJS.Timeout | null = null;
  private paused: boolean = false;
  private onTick: (() => void) | null = null;

  constructor(startDate: Date = new Date("2025-10-04T00:00:00"), mode: SimMode = "accelerated") {
    this.currentTime = new Date(startDate);
    this.mode = mode;
  }

  /**
   * Start the clock
   */
  start(onTick: () => void): void {
    this.onTick = onTick;
    this.paused = false;
    this.scheduleTick();
  }

  /**
   * Pause the clock
   */
  pause(): void {
    this.paused = true;
    if (this.tickInterval) {
      clearTimeout(this.tickInterval);
      this.tickInterval = null;
    }
  }

  /**
   * Resume the clock
   */
  resume(): void {
    if (this.paused && this.onTick) {
      this.paused = false;
      this.scheduleTick();
    }
  }

  /**
   * Reset clock to a new start time
   */
  reset(startDate: Date, mode: SimMode): void {
    this.pause();
    this.currentTime = new Date(startDate);
    this.mode = mode;
  }

  /**
   * Get current simulated time
   */
  now(): Date {
    return new Date(this.currentTime);
  }

  /**
   * Get minute of day (0-1439)
   */
  minuteOfDay(): number {
    return this.currentTime.getHours() * 60 + this.currentTime.getMinutes();
  }

  /**
   * Advance time by 15 minutes
   */
  private advanceMinute(): void {
    this.currentTime = new Date(this.currentTime.getTime() + 15 * 60_000);
  }

  /**
   * Schedule next tick
   */
  private scheduleTick(): void {
    if (this.paused || !this.onTick) return;

    const interval = this.mode === "realtime" ? 60_000 : 1000; // 1 min or 1s (15 min = 1s)

    this.tickInterval = setTimeout(() => {
      this.advanceMinute();
      this.onTick!();
      this.scheduleTick();
    }, interval);
  }

  /**
   * Change mode without losing state
   */
  setMode(mode: SimMode): void {
    const wasRunning = !this.paused;
    if (wasRunning) {
      this.pause();
    }
    this.mode = mode;
    if (wasRunning && this.onTick) {
      this.resume();
    }
  }

  /**
   * Check if clock is running
   */
  isRunning(): boolean {
    return !this.paused && this.tickInterval !== null;
  }
}

