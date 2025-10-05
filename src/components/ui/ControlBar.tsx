import React from 'react';
import { Play, Pause, RotateCcw, Cloud, Zap, AlertTriangle } from 'lucide-react';

interface ControlBarProps {
  isPlaying: boolean;
  speed: number;
  activeEvents: string[];
  onPlayPause: () => void;
  onSpeedChange: (speed: number) => void;
  onEventToggle: (event: string) => void;
  onReset: () => void;
  className?: string;
}

const speedOptions = [0.5, 1, 2, 5];
const eventOptions = [
  { id: 'cloudburst', label: 'Cloudburst', icon: Cloud },
  { id: 'ev-surge', label: 'EV Surge', icon: Zap },
  { id: 'outage', label: 'Outage', icon: AlertTriangle },
];

export function ControlBar({
  isPlaying,
  speed,
  activeEvents,
  onPlayPause,
  onSpeedChange,
  onEventToggle,
  onReset,
  className = ''
}: ControlBarProps) {
  return (
    <div className={`flex items-center gap-4 p-4 bg-card rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] ${className}`}>
      {/* Play/Pause */}
      <button
        onClick={onPlayPause}
        className="control-chip control-chip-active focus-ring flex items-center gap-2"
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        {isPlaying ? 'Pause' : 'Play'}
      </button>

      {/* Speed controls */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted">Speed:</span>
        {speedOptions.map((speedOption) => (
          <button
            key={speedOption}
            onClick={() => onSpeedChange(speedOption)}
            className={`control-chip focus-ring ${
              speed === speedOption ? 'control-chip-active' : 'control-chip-inactive'
            }`}
          >
            {speedOption}x
          </button>
        ))}
      </div>

      {/* Event controls */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted">Events:</span>
        {eventOptions.map((event) => {
          const Icon = event.icon;
          const isActive = activeEvents.includes(event.id);
          return (
            <button
              key={event.id}
              onClick={() => onEventToggle(event.id)}
              className={`control-chip focus-ring flex items-center gap-2 ${
                isActive ? 'control-chip-active' : 'control-chip-inactive'
              }`}
            >
              <Icon className="w-4 h-4" />
              {event.label}
            </button>
          );
        })}
      </div>

      {/* Reset */}
      <button
        onClick={onReset}
        className="control-chip control-chip-inactive focus-ring flex items-center gap-2 ml-auto"
      >
        <RotateCcw className="w-4 h-4" />
        Reset
      </button>
    </div>
  );
}
