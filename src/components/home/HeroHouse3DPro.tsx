import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { SolarPill, HomePill, BatteryPill, GridPill } from './StatPill';
import { HouseGlyph, getHouseAnchors } from './HouseGlyph';
import { calculateFlowPaths } from './flowHelpers';
import { TOKENS } from './tokens';
import { Battery, Zap } from 'lucide-react';

interface HeroHouse3DProProps {
  pvKw: number;
  loadKw: number;
  socPct: number;
  reservePct?: number;
  expKw: number;
  impKw: number;
  shareKw: number;
  recvKw: number;
  updatedAt?: Date;
  className?: string;
}

export function HeroHouse3DPro({
  pvKw,
  loadKw,
  socPct,
  reservePct = 0,
  expKw,
  impKw,
  shareKw,
  recvKw,
  updatedAt,
  className = ""
}: HeroHouse3DProProps) {
  
  // Calculate house anchors and flow paths
  const anchors = useMemo(() => getHouseAnchors(500, 400), []);
  
  const flows = useMemo(() => 
    calculateFlowPaths(
      pvKw,
      loadKw,
      socPct,
      impKw,
      expKw,
      shareKw,
      recvKw,
      anchors
    ), [pvKw, loadKw, socPct, impKw, expKw, shareKw, recvKw, anchors]
  );

  return (
    <Card 
      className={`rounded-3xl border bg-white p-6 md:p-8 shadow-sm relative overflow-hidden ${className}`}
      style={{ 
        borderRadius: TOKENS.radius,
        boxShadow: TOKENS.shadow,
        minHeight: '440px',
      }}
    >
      <div className="relative">
        {/* Main Energy Flow Diagram - Clean Layout */}
        <div className="relative mb-8" style={{ minHeight: '400px' }}>
          {/* House Section - Centered at top */}
          <div className="flex justify-center mb-8">
            <HouseGlyph 
              pvKw={pvKw}
              socPct={socPct}
              width={500}
              height={400}
            />
          </div>

          {/* Three Objects in a Row at Bottom */}
          <div className="flex justify-center items-center gap-8">
            {/* Microgrid Connection - Left */}
            <div className="flex flex-col items-center">
              <div className="bg-green-800 rounded-lg p-4 shadow-lg border-2 border-green-600 mb-2">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-white" />
                  <span className="text-white text-sm font-semibold">Microgrid</span>
                </div>
                <div className="text-white text-xl font-bold">
                  {shareKw.toFixed(1)} kW
                </div>
                <div className="text-green-300 text-sm">
                  Community Sharing
                </div>
                {/* Energy flow indicator */}
                {shareKw > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-green-300 text-sm">Active</span>
                  </div>
                )}
              </div>
            </div>

            {/* Car Section - Center */}
            <div className="flex flex-col items-center">
              <img
                src="/cybertruck.png"
                alt="Tesla Cybertruck"
                className="w-32 h-auto opacity-90 hover:opacity-100 transition-opacity duration-300 mb-2"
              />
              <div className="text-sm text-gray-600 font-medium">Tesla Cybertruck</div>
            </div>

            {/* Battery Pack - Right */}
            <div className="flex flex-col items-center">
              <div className="bg-gray-800 rounded-lg p-4 shadow-lg border-2 border-gray-600 mb-2">
                <div className="flex items-center gap-2 mb-2">
                  <Battery className="h-5 w-5 text-white" />
                  <span className="text-white text-sm font-semibold">Battery Pack</span>
                </div>
                <div className="text-white text-xl font-bold">
                  {socPct.toFixed(0)}%
                </div>
                <div className="text-gray-300 text-sm">
                  {(socPct * 0.06).toFixed(1)}kWh / 6kWh
                </div>
                {/* Battery level indicator */}
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      socPct < 20 ? 'bg-red-500' : 
                      socPct < 60 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${socPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stat Pills positioned around the hero - Better alignment */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{ marginTop: '24px' }}>
          {/* Top Left - Solar */}
          <div className="flex justify-center">
            <SolarPill kw={pvKw} />
          </div>
          
          {/* Top Right - Home */}
          <div className="flex justify-center">
            <HomePill kw={loadKw} />
          </div>
          
          {/* Bottom Left - Battery */}
          <div className="flex justify-center">
            <BatteryPill soc={socPct} />
          </div>
          
          {/* Bottom Right - Grid */}
          <div className="flex justify-center">
            <GridPill imp={impKw} exp={expKw} />
          </div>
        </div>

        {/* Status row - outside hero content area */}
        <div className="mt-6 pt-4 border-t border-[var(--border)]">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[var(--muted)]">Live Data</span>
              </div>
              {updatedAt && (
                <span className="text-[var(--muted)]">
                  Updated {updatedAt.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
          
          {/* Energy flow legend */}
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-[var(--muted)]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-[var(--solar)] rounded" />
              <span>Solar Generation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-[var(--purple)] rounded" />
              <span>Battery Flow</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-[var(--teal)] rounded" style={{ borderStyle: 'dashed' }} />
              <span>Grid Export</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-[var(--red)] rounded" style={{ borderStyle: 'dashed' }} />
              <span>Grid Import</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
