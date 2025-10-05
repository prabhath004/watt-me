import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface MetricTileProps {
  title: string;
  value: string;
  caption?: string;
  icon?: React.ReactNode;
  tone?: 'neutral' | 'good' | 'bad' | 'info';
}

export function MetricTile({ 
  title, 
  value, 
  caption, 
  icon, 
  tone = 'neutral' 
}: MetricTileProps) {
  const getToneStyles = () => {
    switch (tone) {
      case 'good':
        return 'text-[var(--good)]';
      case 'bad':
        return 'text-[var(--bad)]';
      case 'info':
        return 'text-[var(--accent)]';
      default:
        return 'text-[var(--ink)]';
    }
  };

  return (
    <Card className="rounded-2xl border bg-[var(--surface)] shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {icon && (
                <div className="text-[var(--muted)]">
                  {icon}
                </div>
              )}
              <h3 className="text-sm font-medium text-[var(--muted)]">
                {title}
              </h3>
            </div>
            <div className={`text-3xl font-bold ${getToneStyles()}`}>
              {value}
            </div>
            {caption && (
              <p className="text-xs text-[var(--muted)] mt-1">
                {caption}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
