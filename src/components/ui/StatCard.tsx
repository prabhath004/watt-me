import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  subtext?: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  subtext, 
  trend = 'neutral',
  className = ''
}: StatCardProps) {
  const trendIcons = {
    up: '↗',
    down: '↘',
    neutral: '',
  };

  return (
    <div className={`card-modern hover-lift ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-h3 text-accent">{title}</h3>
        {Icon && (
          <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-brand" />
          </div>
        )}
      </div>
      
      <div className="text-4xl font-bold text-accent font-mono mb-2">
        {typeof value === 'number' ? Math.round(value) : value}
        {trend !== 'neutral' && (
          <span className="ml-2 text-lg text-muted">{trendIcons[trend]}</span>
        )}
      </div>
      
      {subtext && (
        <div className="text-sm text-muted">{subtext}</div>
      )}
    </div>
  );
}
