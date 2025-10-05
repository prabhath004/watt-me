import React from 'react';

interface StatusPillProps {
  status: 'live' | 'paused' | 'error' | 'loading';
  speed?: number;
  className?: string;
}

export function StatusPill({ status, speed, className = '' }: StatusPillProps) {
  const statusConfig = {
    live: {
      label: 'Live',
      icon: '●',
      className: 'status-live',
    },
    paused: {
      label: 'Paused',
      icon: '⏸',
      className: 'status-paused',
    },
    error: {
      label: 'Error',
      icon: '⚠',
      className: 'bg-error/20 text-error border border-error/30',
    },
    loading: {
      label: 'Loading',
      icon: '⟳',
      className: 'bg-muted/20 text-muted border border-muted/30',
    },
  };

  const config = statusConfig[status];
  const speedText = speed ? ` • ${speed}x` : '';

  return (
    <div className={`status-pill ${config.className} ${className}`}>
      <span className="mr-1">{config.icon}</span>
      {config.label}{speedText}
    </div>
  );
}
