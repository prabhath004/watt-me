import React from 'react';
import { Card } from '@/components/ui/card';
import { SocRing } from './SocRing';

interface HeroHouse3DProps {
  pvKw: number;
  loadKw: number;
  socPct: number;
  gridImpKw: number;
  gridExpKw: number;
  shareKw: number;
  recvKw: number;
}

export function HeroHouse3D({
  pvKw,
  loadKw,
  socPct,
  gridImpKw,
  gridExpKw,
  shareKw,
  recvKw
}: HeroHouse3DProps) {
  // Map kW to stroke width and opacity
  const getStrokeWidth = (kw: number) => Math.max(1.5, Math.min(5, kw * 0.8));
  const getOpacity = (kw: number) => kw > 0 ? 1 : 0.25;

  return (
    <Card className="rounded-3xl border bg-[var(--surface)] p-8 shadow-sm">
      <div className="relative">
        <svg 
          viewBox="0 0 800 420" 
          className="w-full h-auto"
          aria-label="Isometric house diagram showing energy flows"
        >
          <defs>
            {/* Solar panel gradient */}
            <linearGradient id="panel" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1f2937" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>
            
            {/* House wall gradient */}
            <linearGradient id="wall" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f8fafc" />
            </linearGradient>
            
            {/* Roof gradient */}
            <linearGradient id="roof" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
          </defs>

          {/* House Structure */}
          <g>
            {/* Main house body */}
            <path 
              d="M120,210 L280,120 L460,200 L460,330 L120,330 Z" 
              fill="url(#wall)" 
              stroke="#e5e7eb"
              strokeWidth="2"
            />
            
            {/* Roof */}
            <path 
              d="M280,120 L480,60 L660,140 L460,200 Z" 
              fill="url(#roof)" 
              stroke="#94a3b8"
              strokeWidth="2"
            />
            
            {/* Solar panels */}
            <rect 
              x="520" 
              y="92" 
              width="110" 
              height="32" 
              rx="4" 
              fill="url(#panel)" 
              opacity={getOpacity(pvKw)}
              className="transition-opacity duration-500"
            />
            <rect 
              x="600" 
              y="120" 
              width="110" 
              height="32" 
              rx="4" 
              fill="url(#panel)" 
              opacity={getOpacity(pvKw)}
              className="transition-opacity duration-500"
            />
            
            {/* Battery block */}
            <rect 
              x="450" 
              y="250" 
              width="28" 
              height="62" 
              rx="6" 
              fill="#f8fafc" 
              stroke="#d1d5db"
              strokeWidth="2"
            />
            
            {/* Windows */}
            <rect x="140" y="240" width="40" height="50" rx="4" fill="#ffffff" stroke="#d1d5db" strokeWidth="1"/>
            <rect x="200" y="240" width="40" height="50" rx="4" fill="#ffffff" stroke="#d1d5db" strokeWidth="1"/>
            <rect x="320" y="240" width="40" height="50" rx="4" fill="#ffffff" stroke="#d1d5db" strokeWidth="1"/>
            
            {/* Door */}
            <rect x="260" y="280" width="30" height="50" rx="4" fill="#374151" stroke="#1f2937" strokeWidth="1"/>
          </g>

          {/* Animated Energy Flow Lines */}
          <g strokeLinecap="round" fill="none">
            {/* PV → Battery */}
            <path 
              d="M650,136 C610,180 520,210 464,258"
              stroke="#0ea5e9" 
              strokeWidth={getStrokeWidth(pvKw)} 
              opacity={getOpacity(pvKw)}
              className="transition-all duration-500"
            >
              <animate 
                attributeName="opacity" 
                values="0.6;1;0.6" 
                dur="2s" 
                repeatCount="indefinite"
              />
            </path>
            
            {/* Battery → Home */}
            <path 
              d="M464,260 C420,260 380,260 340,260"
              stroke="#7c3aed" 
              strokeWidth={getStrokeWidth(loadKw)} 
              opacity={getOpacity(loadKw)}
              className="transition-all duration-500"
            >
              <animate 
                attributeName="opacity" 
                values="0.6;1;0.6" 
                dur="2s" 
                repeatCount="indefinite"
              />
            </path>
            
            {/* Home → Grid (export) */}
            <path 
              d="M340,260 C300,240 220,210 100,220"
              stroke="#22c55e" 
              strokeWidth={getStrokeWidth(gridExpKw)} 
              opacity={getOpacity(gridExpKw)} 
              strokeDasharray="6 6"
              className="transition-all duration-500"
            >
              <animate 
                attributeName="opacity" 
                values="0.4;0.8;0.4" 
                dur="2s" 
                repeatCount="indefinite"
              />
            </path>
            
            {/* Grid → Home (import) */}
            <path 
              d="M100,240 C220,250 300,280 340,300"
              stroke="#ef4444" 
              strokeWidth={getStrokeWidth(gridImpKw)} 
              opacity={getOpacity(gridImpKw)} 
              strokeDasharray="6 6"
              className="transition-all duration-500"
            >
              <animate 
                attributeName="opacity" 
                values="0.4;0.8;0.4" 
                dur="2s" 
                repeatCount="indefinite"
              />
            </path>
            
            {/* Community sharing flows */}
            <path 
              d="M340,280 C380,300 420,320 460,340"
              stroke="#16a34a" 
              strokeWidth={getStrokeWidth(shareKw)} 
              opacity={getOpacity(shareKw)} 
              strokeDasharray="4 4"
              className="transition-all duration-500"
            >
              <animate 
                attributeName="opacity" 
                values="0.5;0.9;0.5" 
                dur="2s" 
                repeatCount="indefinite"
              />
            </path>
            
            <path 
              d="M460,320 C420,300 380,280 340,260"
              stroke="#0ea5e9" 
              strokeWidth={getStrokeWidth(recvKw)} 
              opacity={getOpacity(recvKw)} 
              strokeDasharray="4 4"
              className="transition-all duration-500"
            >
              <animate 
                attributeName="opacity" 
                values="0.5;0.9;0.5" 
                dur="2s" 
                repeatCount="indefinite"
              />
            </path>
          </g>
        </svg>

        {/* SOC Ring overlay at battery position */}
        <div className="absolute left-[446px] top-[238px]">
          <SocRing value={socPct} size={64} />
        </div>

        {/* Corner Labels with Live Values */}
        {/* Solar - Top Left */}
        <div className="absolute left-4 top-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-sm border">
            <div className="text-xs text-[var(--muted)] mb-1">Solar</div>
            <div className="text-2xl font-bold text-[var(--solar)]">{pvKw.toFixed(1)} kW</div>
          </div>
        </div>

        {/* Home - Top Right */}
        <div className="absolute right-4 top-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-sm border">
            <div className="text-xs text-[var(--muted)] mb-1">Home</div>
            <div className="text-2xl font-bold text-[var(--ink)]">{loadKw.toFixed(1)} kW</div>
          </div>
        </div>

        {/* Battery - Bottom Left */}
        <div className="absolute left-4 bottom-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-sm border">
            <div className="text-xs text-[var(--muted)] mb-1">Battery</div>
            <div className="text-2xl font-bold text-[var(--battery)]">{socPct.toFixed(0)}%</div>
          </div>
        </div>

        {/* Grid - Bottom Right */}
        <div className="absolute right-4 bottom-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-sm border">
            <div className="text-xs text-[var(--muted)] mb-1">Grid</div>
            <div className="text-2xl font-bold text-[var(--accent)]">
              {gridExpKw > gridImpKw ? `+${gridExpKw.toFixed(1)}` : `-${gridImpKw.toFixed(1)}`} kW
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
