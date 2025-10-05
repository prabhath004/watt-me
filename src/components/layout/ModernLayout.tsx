import React from 'react';
import { StatusPill } from '../ui/StatusPill';

interface ModernLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  status?: 'live' | 'paused' | 'error' | 'loading';
  speed?: number;
  actionButton?: React.ReactNode;
  className?: string;
}

export function ModernLayout({
  children,
  title,
  subtitle,
  status = 'live',
  speed,
  actionButton,
  className = ''
}: ModernLayoutProps) {
  return (
    <div className={`min-h-screen bg-bg ${className}`}>
      {/* Sticky topbar */}
      <div className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-h2 text-accent">{title}</h1>
              {subtitle && (
                <span className="text-sm text-muted">{subtitle}</span>
              )}
            </div>
            <div className="flex items-center gap-4">
              {actionButton}
              <StatusPill status={status} speed={speed} />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}
