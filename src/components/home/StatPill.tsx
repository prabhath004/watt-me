import React from 'react';
import { TOKENS, TYPE, formatKw, formatPercent } from './tokens';

interface StatPillProps {
  title: "Solar" | "Home" | "Battery" | "Grid" | string;
  value: string; // formatted
  tone?: "solar" | "neutral" | "battery" | "export" | "import";
  icon?: React.ReactNode;
  align?: "left" | "right";
}

export function StatPill({ 
  title, 
  value, 
  tone = "neutral", 
  icon, 
  align = "left"
}: StatPillProps) {
  const getToneStyles = () => {
    switch (tone) {
      case 'solar':
        return {
          valueColor: '#f59e0b',
          bgColor: 'bg-white dark:bg-gray-900',
          borderColor: 'border-3 border-yellow-500 dark:border-yellow-400',
          shadowColor: 'shadow-[0_0_0_2px_rgba(234,179,8,0.2)] hover:shadow-[0_0_0_3px_rgba(234,179,8,0.3)]',
        };
      case 'battery':
        return {
          valueColor: '#a855f7',
          bgColor: 'bg-white dark:bg-gray-900',
          borderColor: 'border-3 border-purple-500 dark:border-purple-400',
          shadowColor: 'shadow-[0_0_0_2px_rgba(168,85,247,0.2)] hover:shadow-[0_0_0_3px_rgba(168,85,247,0.3)]',
        };
      case 'export':
        return {
          valueColor: '#06b6d4',
          bgColor: 'bg-white dark:bg-gray-900',
          borderColor: 'border-3 border-cyan-500 dark:border-cyan-400',
          shadowColor: 'shadow-[0_0_0_2px_rgba(6,182,212,0.2)] hover:shadow-[0_0_0_3px_rgba(6,182,212,0.3)]',
        };
      case 'import':
        return {
          valueColor: '#ef4444',
          bgColor: 'bg-white dark:bg-gray-900',
          borderColor: 'border-3 border-red-500 dark:border-red-400',
          shadowColor: 'shadow-[0_0_0_2px_rgba(239,68,68,0.2)] hover:shadow-[0_0_0_3px_rgba(239,68,68,0.3)]',
        };
      default:
        return {
          valueColor: '#374151',
          bgColor: 'bg-white dark:bg-gray-900',
          borderColor: 'border-3 border-gray-500 dark:border-gray-400',
          shadowColor: 'shadow-[0_0_0_2px_rgba(107,114,128,0.2)] hover:shadow-[0_0_0_3px_rgba(107,114,128,0.3)]',
        };
    }
  };

  const styles = getToneStyles();

  return (
    <div 
      className={`
        ${styles.bgColor} ${styles.borderColor} ${styles.shadowColor}
        px-4 py-3 md:px-6 md:py-4
        transition-all duration-200 hover:-translate-y-1
        ${align === 'right' ? 'text-right' : 'text-left'}
      `}
    >
      <div className="flex items-center gap-3 mb-2">
        {icon && (
          <div className="text-gray-600 dark:text-gray-400">
            {icon}
          </div>
        )}
        <h3 className="text-base font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          {title}
        </h3>
      </div>
      
      <div 
        className="text-2xl font-black font-mono tabular-nums"
        style={{ color: styles.valueColor }}
      >
        {value}
      </div>
    </div>
  );
}

// Sharp Modern Convenience components for specific stat types
export function SolarPill({ kw }: { kw: number }) {
  return (
    <StatPill
      title="Solar"
      value={`${formatKw(kw)} kW`}
      tone="solar"
      icon={<div className="w-4 h-4 bg-yellow-500 border-2 border-yellow-600 dark:border-yellow-400" />}
    />
  );
}

export function HomePill({ kw }: { kw: number }) {
  return (
    <StatPill
      title="Home"
      value={`${formatKw(kw)} kW`}
      tone="neutral"
      icon={<div className="w-4 h-4 bg-gray-500 border-2 border-gray-600 dark:border-gray-400" />}
    />
  );
}

export function BatteryPill({ soc }: { soc: number }) {
  return (
    <StatPill
      title="Battery"
      value={`${formatPercent(soc)}%`}
      tone="battery"
      icon={<div className="w-4 h-4 bg-purple-500 border-2 border-purple-600 dark:border-purple-400" />}
    />
  );
}

export function GridPill({ imp, exp }: { imp: number; exp: number }) {
  const isExporting = exp > imp;
  const value = isExporting ? `+${formatKw(exp)}` : `↓${formatKw(imp)}`;
  
  return (
    <StatPill
      title="Grid"
      value={`${value} kW`}
      tone={isExporting ? "export" : "import"}
      icon={<div className={`w-4 h-4 border-2 ${isExporting ? 'bg-cyan-500 border-cyan-600 dark:border-cyan-400' : 'bg-red-500 border-red-600 dark:border-red-400'}`} />}
    />
  );
}
