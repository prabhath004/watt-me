import React, { forwardRef } from 'react';
import { TOKENS, opacityForKw } from './tokens';
import { HouseAnchors } from './flowHelpers';

interface HouseGlyphProps {
  pvKw: number;
  socPct: number;
  width?: number;
  height?: number;
}

export const HouseGlyph = forwardRef<SVGSVGElement, HouseGlyphProps>(
  ({ pvKw, socPct, width = 500, height = 400 }, ref) => {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Calculate anchor points for the house image
    const anchors: HouseAnchors = {
      pvAnchor: { x: centerX, y: centerY - 80 },      // Top of roof where solar panels would be
      batteryAnchor: { x: centerX + 100, y: centerY + 20 },  // Right side where battery would be
      homeAnchor: { x: centerX, y: centerY + 30 },    // Center of house
      gridAnchor: { x: centerX + 150, y: centerY + 20 },    // Right side grid connection
    };

    const pvOpacity = opacityForKw(pvKw);

    return (
      <div className="relative">
        {/* House PNG Image */}
        <img
          src="/house.png"
          alt="Modern house with solar panels"
          className="w-full h-auto max-w-md mx-auto"
          style={{
            filter: pvKw > 0 ? 'brightness(1.1)' : 'brightness(1)',
            transition: 'filter 0.5s ease-in-out'
          }}
        />
      </div>
    );
  }
);

HouseGlyph.displayName = 'HouseGlyph';

// Export anchor calculation function
export function getHouseAnchors(svgWidth: number, svgHeight: number): HouseAnchors {
  const centerX = svgWidth / 2;
  const centerY = svgHeight / 2;
  
  return {
    pvAnchor: { x: centerX, y: centerY - 80 },      // Top of roof where solar panels would be
    batteryAnchor: { x: centerX + 100, y: centerY + 20 },  // Right side where battery would be
    homeAnchor: { x: centerX, y: centerY + 30 },    // Center of house
    gridAnchor: { x: centerX + 150, y: centerY + 20 },    // Right side grid connection
  };
}
