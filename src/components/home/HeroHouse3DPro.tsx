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
      className={`bg-white dark:bg-gray-900 border-3 border-green-600 dark:border-green-400 shadow-[0_0_0_2px_rgba(34,197,94,0.2)] hover:shadow-[0_0_0_3px_rgba(34,197,94,0.3)] transition-all duration-200 p-8 relative overflow-hidden ${className}`}
      style={{ 
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
            {/* Sharp Modern Microgrid Connection - Left */}
            <div className="flex flex-col items-center">
              <div className="bg-green-600 dark:bg-green-400 border-3 border-green-600 dark:border-green-400 shadow-[0_0_0_2px_rgba(34,197,94,0.3)] p-6 mb-3">
                <div className="flex items-center gap-3 mb-3">
                  <Zap className="h-6 w-6 text-white dark:text-black" />
                  <span className="text-white dark:text-black text-lg font-black">Microgrid</span>
                </div>
                <div className="text-white dark:text-black text-2xl font-black mb-2">
                  {shareKw.toFixed(1)} kW
                </div>
                <div className="text-green-100 dark:text-green-900 text-base font-black">
                  Community Sharing
                </div>
                {/* Sharp Modern Energy flow indicator */}
                {shareKw > 0 && (
                  <div className="flex items-center gap-2 mt-3">
                    <div className="w-3 h-3 bg-green-400 dark:bg-green-600 animate-pulse" />
                    <span className="text-green-100 dark:text-green-900 text-base font-black">Active</span>
                  </div>
                )}
              </div>
            </div>

            {/* Sharp Modern Car Section - Center */}
            <div className="flex flex-col items-center">
              <img
                src="/cybertruck.png"
                alt="Tesla Cybertruck"
                className="w-32 h-auto opacity-90 hover:opacity-100 transition-opacity duration-300 mb-3"
              />
              <div className="text-base text-gray-800 dark:text-white font-black">Tesla Cybertruck</div>
            </div>

            {/* Sharp Modern Battery Pack - Right */}
            <div className="flex flex-col items-center">
              <div className="bg-gray-800 dark:bg-gray-700 border-3 border-gray-600 dark:border-gray-500 shadow-[0_0_0_2px_rgba(107,114,128,0.3)] p-6 mb-3">
                <div className="flex items-center gap-3 mb-3">
                  <Battery className="h-6 w-6 text-white dark:text-white" />
                  <span className="text-white dark:text-white text-lg font-black">Battery Pack</span>
                </div>
                <div className="text-white dark:text-white text-2xl font-black mb-2">
                  {socPct.toFixed(0)}%
                </div>
                <div className="text-gray-300 dark:text-gray-300 text-base font-black mb-3">
                  {(socPct * 0.06).toFixed(1)}kWh / 6kWh
                </div>
                {/* Sharp Modern Battery level indicator */}
                <div className="w-full bg-gray-700 dark:bg-gray-600 h-3 border-2 border-gray-600 dark:border-gray-500">
                  <div 
                    className={`h-full transition-all duration-500 ${
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

        {/* Sharp Modern Status row - outside hero content area */}
        <div className="mt-8 pt-6 border-t-3 border-green-600 dark:border-green-400">
          <div className="flex items-center justify-between text-base">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-600 dark:bg-green-400 animate-pulse" />
                <span className="text-gray-700 dark:text-gray-300 font-black">Live Data</span>
              </div>
              {updatedAt && (
                <span className="text-gray-600 dark:text-gray-400 font-black">
                  Updated {updatedAt.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
          
          {/* Sharp Modern Energy flow legend */}
          <div className="mt-4 flex flex-wrap gap-6 text-base text-gray-700 dark:text-gray-300">
            <div className="flex items-center gap-3">
              <div className="w-4 h-1 bg-yellow-500" />
              <span className="font-black">Solar Generation</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-1 bg-purple-500" />
              <span className="font-black">Battery Flow</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-1 bg-cyan-500" style={{ borderStyle: 'dashed' }} />
              <span className="font-black">Grid Export</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-1 bg-red-500" style={{ borderStyle: 'dashed' }} />
              <span className="font-black">Grid Import</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
