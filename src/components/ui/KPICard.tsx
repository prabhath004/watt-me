import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  subtext?: string;
  color?: 'prod-gold' | 'share-green' | 'grid-blue' | 'brand-2' | 'cons-red';
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function KPICard({ 
  icon: Icon, 
  title, 
  value, 
  subtext, 
  color = 'brand-2',
  trend = 'neutral',
  className = ''
}: KPICardProps) {
  const colorClasses = {
    'prod-gold': 'text-prod-gold bg-prod-gold/10',
    'share-green': 'text-share-green bg-share-green/10',
    'grid-blue': 'text-grid-blue bg-grid-blue/10',
    'brand-2': 'text-brand-2 bg-brand-2/10',
    'cons-red': 'text-cons-red bg-cons-red/10',
  };

  const trendIcons = {
    up: '↗',
    down: '↘',
    neutral: '',
  };

  return (
    <div className={`kpi-pill ${className}`}>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${colorClasses[color]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted font-medium mb-1">{title}</div>
        <div className="text-2xl font-bold text-accent font-mono">
          {typeof value === 'number' ? Math.round(value) : value}
          {trend !== 'neutral' && (
            <span className="ml-1 text-sm text-muted">{trendIcons[trend]}</span>
          )}
        </div>
        {subtext && (
          <div className="text-xs text-muted mt-1">{subtext}</div>
        )}
      </div>
    </div>
  );
}
