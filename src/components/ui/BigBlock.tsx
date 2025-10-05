import React from 'react';

interface BigBlockProps {
  label: string;
  value: string | number;
  unit?: string;
  percentage?: boolean;
  className?: string;
}

export function BigBlock({ 
  label, 
  value, 
  unit = '', 
  percentage = false,
  className = ''
}: BigBlockProps) {
  const displayValue = typeof value === 'number' ? Math.round(value) : value;
  const clampedValue = percentage ? Math.max(0, Math.min(100, Number(displayValue))) : displayValue;

  return (
    <div className={`big-block hover-lift focus-ring ${className}`}>
      <div className="text-6xl font-bold font-mono mb-2">
        {clampedValue}
        {unit && <span className="text-2xl ml-1">{unit}</span>}
      </div>
      <div className="text-lg font-semibold">{label}</div>
    </div>
  );
}
