import { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Zap, Battery, TrendingUp, TrendingDown } from 'lucide-react';
import { normalizeHomeId, r, validateMapBindings } from '@/lib/homeUtils';
import { useHomeSafe } from '@/hooks/useHomeSafe';

interface SSEHome {
  id: string;
  pv: number;
  load: number;
  soc: number;
  share: number;
  recv: number;
  imp: number;
  exp: number;
  creditsDelta: number;
}

interface InteractiveMapProps {
  homes: SSEHome[];
}

interface HousePosition {
  id: string;
  x: number;
  y: number;
  type: 'house' | '101mi' | 'special';
}

const InteractiveMap = ({ homes }: InteractiveMapProps) => {
  const [hoveredHouse, setHoveredHouse] = useState<string | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapWarning, setMapWarning] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [mapContainer, setMapContainer] = useState<HTMLDivElement | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Validate map bindings at boot
  useEffect(() => {
    const markerIds = housePositions.map(h => normalizeHomeId(h.id));
    const storeIds = homes.map(h => normalizeHomeId(h.id));
    validateMapBindings(markerIds, storeIds);
  }, [homes]);

  // Dev command to scan all map hovers
  const scanMapHovers = useCallback(() => {
    console.log('[Map Scan] Starting hover test...');
    let errors = 0;
    let scanned = 0;
    
    housePositions.forEach((house, index) => {
      try {
        console.log(`[Map Scan] Testing house ${index + 1}/${housePositions.length}: ${house.id}`);
        
        // Simulate hover
        const homeData = useHomeSafe(house.id, homes);
        console.log(`[Map Scan] ${house.id}:`, {
          id: homeData.id,
          member: homeData.member,
          pv_kw: homeData.now.pv_kw,
          load_kw: homeData.now.load_kw,
          soc_pct: homeData.now.soc_pct
        });
        
        scanned++;
      } catch (error) {
        console.error(`[Map Scan] Error on ${house.id}:`, error);
        errors++;
      }
    });
    
    console.log(`[Map Scan] Complete: Scanned ${scanned} markers — ${errors} errors`);
    return { scanned, errors };
  }, [homes]);

  // Expose scan function to window for dev testing
  useEffect(() => {
    (window as any).scanMapHovers = scanMapHovers;
    return () => {
      delete (window as any).scanMapHovers;
    };
  }, [scanMapHovers]);

  // Defensive event handler that never throws
  const handleMouseEnter = useCallback((houseId: string) => {
    try {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      
      const normalizedId = normalizeHomeId(houseId);
      const found = homes.find(h => normalizeHomeId(h.id) === normalizedId);
      
      console.log('[Map Hover]', { 
        targetId: houseId, 
        normalizedId, 
        found: !!found,
        homesCount: homes.length 
      });
      
      setHoveredHouse(houseId);
      setMapError(null);
      setMapWarning(null);
    } catch (error) {
      console.error('[Map] hover error', error, { houseId });
      setMapWarning('Hover error — see console');
    }
  }, [homes]);

  const handleMouseLeave = useCallback(() => {
    try {
      hoverTimeoutRef.current = setTimeout(() => {
        setHoveredHouse(null);
      }, 150); // Debounce for smooth interaction
    } catch (error) {
      console.error('[Map] mouse leave error', error);
      setMapWarning('Hover error — see console');
    }
  }, []);

  // House positions on the map (matching the blue squares in your map)
  const housePositions: HousePosition[] = [
    // Houses along Lenah Mill Blvd (main loop) - blue squares (Microgrid)
    { id: 'Johnson', x: 180, y: 160, type: 'house' },
    { id: 'Smith', x: 220, y: 180, type: 'house' },
    { id: 'Williams', x: 260, y: 200, type: 'house' },
    { id: 'Brown', x: 300, y: 220, type: 'house' },
    { id: 'Davis', x: 340, y: 240, type: 'house' },
    { id: 'Miller', x: 380, y: 260, type: 'house' },
    { id: 'Wilson', x: 420, y: 280, type: 'house' },
    { id: 'Moore', x: 460, y: 300, type: 'house' },
    { id: 'Taylor', x: 500, y: 320, type: 'house' },
    { id: 'Anderson', x: 540, y: 340, type: 'house' },
    
    // Houses along Aurumm Sun Dr (curved road) - white squares (Non-microgrid)
    { id: 'Garcia', x: 160, y: 100, type: '101mi' },
    { id: 'Martinez', x: 200, y: 120, type: '101mi' },
    { id: 'Rodriguez', x: 240, y: 140, type: '101mi' },
    { id: 'Lopez', x: 280, y: 160, type: '101mi' },
    
    // Houses along Ladybug Ct (bottom-left) - yellow squares (Special)
    { id: 'Gonzalez', x: 140, y: 380, type: 'special' },
    { id: 'Hernandez', x: 170, y: 400, type: 'special' },
    { id: 'Perez', x: 200, y: 420, type: 'special' },
    { id: 'Sanchez', x: 230, y: 440, type: 'special' },
    { id: 'Ramirez', x: 260, y: 460, type: 'special' },
    
    // Houses along Little Free (mid-right) - blue squares (Microgrid)
    { id: 'Flores', x: 520, y: 180, type: 'house' },
    { id: 'Rivera', x: 560, y: 200, type: 'house' },
    { id: 'Cooper', x: 600, y: 220, type: 'house' },
    { id: 'Reed', x: 640, y: 240, type: 'house' },
    { id: 'Cook', x: 680, y: 260, type: 'house' },
    
    // Additional houses to match simulation data (H016-H020)
    { id: 'Bailey', x: 480, y: 380, type: '101mi' },
    { id: 'Murphy', x: 520, y: 400, type: '101mi' },
    { id: 'Kelly', x: 560, y: 420, type: '101mi' },
    { id: 'Howard', x: 600, y: 440, type: '101mi' },
    { id: 'Ward', x: 640, y: 460, type: '101mi' },
  ];

  // Mapping from family names to simulation IDs
  const familyToSimId: { [key: string]: string } = {
    'Johnson': 'H001',
    'Smith': 'H002', 
    'Williams': 'H003',
    'Brown': 'H004',
    'Davis': 'H005',
    'Miller': 'H006',
    'Wilson': 'H007',
    'Moore': 'H008',
    'Taylor': 'H009',
    'Anderson': 'H010',
    'Garcia': 'H011',
    'Martinez': 'H012',
    'Rodriguez': 'H013',
    'Lopez': 'H014',
    'Gonzalez': 'H015',
    'Flores': 'H016',
    'Rivera': 'H017',
    'Cooper': 'H018',
    'Reed': 'H019',
    'Cook': 'H020',
    'Bailey': 'H021',
    'Murphy': 'H022',
    'Kelly': 'H023',
    'Howard': 'H024',
    'Ward': 'H025'
  };

  // Safe tooltip component
  const SafeTooltip = ({ houseId }: { houseId: string }) => {
    const homeData = useHomeSafe(houseId, homes);
    const house = housePositions.find(h => h.id === houseId);
    const isNonMember = house?.type === '101mi' || house?.type === 'special';
    
    if (isNonMember) {
      return (
        <div className="space-y-3">
          <div className="font-semibold text-base text-gray-900 border-b border-gray-200 pb-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
            {houseId} Family
          </div>
          
          <div className="text-sm text-gray-600">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <span className="font-medium">Not in microgrid</span>
            </div>
            <p className="text-xs">No sharing data available</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-3">
        <div className="font-semibold text-base text-gray-900 border-b border-gray-200 pb-2 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          {houseId} Family
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 flex items-center gap-2">
              <Zap className="h-3 w-3 text-green-500" />
              PV:
            </span>
            <span className="font-mono text-green-600 font-medium">
              {r(homeData.now.pv_kw)} kW
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600 flex items-center gap-2">
              <TrendingDown className="h-3 w-3 text-yellow-500" />
              Load:
            </span>
            <span className="font-mono text-yellow-600 font-medium">
              {r(homeData.now.load_kw)} kW
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600 flex items-center gap-2">
              <Battery className="h-3 w-3 text-blue-500" />
              SOC:
            </span>
            <span className="font-mono text-blue-600 font-medium">
              {r(homeData.now.soc_pct)}%
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600 flex items-center gap-2">
              <TrendingUp className="h-3 w-3 text-red-500" />
              Import:
            </span>
            <span className="font-mono text-red-600 font-medium">
              {r(homeData.now.grid_in_kw)} kW
            </span>
          </div>
          
          {homeData.now.share_kw > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                Sharing:
              </span>
              <span className="font-mono text-green-600 font-medium">
                {r(homeData.now.share_kw)} kW
              </span>
            </div>
          )}
          
          {homeData.now.recv_kw > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                Receiving:
              </span>
              <span className="font-mono text-cyan-600 font-medium">
                {r(homeData.now.recv_kw)} kW
              </span>
            </div>
          )}
          
          {homeData.now.grid_out_kw > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                Exporting:
              </span>
              <span className="font-mono text-purple-600 font-medium">
                {r(homeData.now.grid_out_kw)} kW
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const getHouseColor = (house: HousePosition) => {
    const homeData = useHomeSafe(house.id, homes);
    
    // Soft, translucent colors for glass-like effect
    if (homeData.now.pv_kw > 0) return '#34D399'; // Soft green for producing
    if (homeData.now.share_kw > 0) return '#60A5FA'; // Soft blue for sharing
    if (homeData.now.grid_in_kw > 0) return '#F87171'; // Soft red for importing
    return '#60A5FA'; // Soft blue for neutral
  };

  const getHouseBorderColor = (house: HousePosition) => {
    const homeData = useHomeSafe(house.id, homes);

    // Soft border colors based on SOC
    if (homeData.now.soc_pct > 60) return '#34D399'; // Soft green
    if (homeData.now.soc_pct > 30) return '#FBBF24'; // Soft yellow
    return '#F87171'; // Soft red
  };

  const getHouseSize = (house: HousePosition) => {
    const homeData = useHomeSafe(house.id, homes);

    // Size based on total power (PV + Load)
    const totalPower = homeData.now.pv_kw + homeData.now.load_kw;
    if (totalPower > 5) return 20;
    if (totalPower > 3) return 18;
    return 16;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <CardTitle>Sunset Ridge Community</CardTitle>
        </div>
        <CardDescription>
          Real-time microgrid energy monitoring
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div 
          ref={setMapContainer}
          className="relative rounded-lg overflow-hidden" 
          style={{ height: '600px' }}
        >
          {/* Map Background */}
          <img
            src="/map.png"
            alt="Lenah Mill Community Map"
            className="absolute inset-0 w-full h-full object-contain"
            style={{ opacity: 0.9, pointerEvents: 'none' }}
          />
          
          {/* Interactive SVG Overlay */}
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 1000 800"
            className="absolute inset-0 z-10"
            style={{ pointerEvents: 'auto' }}
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Semi-transparent overlay */}
            <rect width="1000" height="800" fill="#000000" fillOpacity="0.1" />
            
            {/* Interactive Houses - Only Blue Houses (Microgrid) */}
            {housePositions.map((house) => {
              const data = getHouseData(house.id);
              const size = getHouseSize(house);
              const isHovered = hoveredHouse === house.id;
              const isInteractive = house.type === 'house'; // Only blue houses are interactive
              const isNonMember = house.type === '101mi' || house.type === 'special';
              
              return (
                <g key={house.id}>
                  {/* Interactive hit area - only for blue houses */}
                  {isInteractive && (
                    <circle
                      cx={house.x}
                      cy={house.y}
                      r="20"
                      fill="transparent"
                      onMouseEnter={() => handleMouseEnter(house.id)}
                      onMouseLeave={handleMouseLeave}
                      style={{ 
                        cursor: 'pointer',
                        pointerEvents: 'auto'
                      }}
                      data-home-id={normalizeHomeId(house.id)}
                    />
                  )}
                  
                  {/* Non-member house indicator */}
                  {isNonMember && (
                    <circle
                      cx={house.x}
                      cy={house.y}
                      r="15"
                      fill="transparent"
                      onMouseEnter={() => handleMouseEnter(house.id)}
                      onMouseLeave={handleMouseLeave}
                      style={{ 
                        cursor: 'help',
                        pointerEvents: 'auto'
                      }}
                    />
                  )}
                  
                  {/* Glass-like House Rectangle */}
                  <rect
                    x={house.x - size/2}
                    y={house.y - size/2}
                    width={size}
                    height={size}
                    fill={getHouseColor(house)}
                    stroke={getHouseBorderColor(house)}
                    strokeWidth={isHovered && isInteractive ? 2 : 1}
                    rx="4"
                    fillOpacity={isHovered && isInteractive ? 0.6 : 0.4}
                    strokeOpacity={isHovered && isInteractive ? 0.8 : 0.6}
                    style={{
                      filter: isHovered && isInteractive
                        ? 'drop-shadow(0 0 12px rgba(96, 165, 250, 0.4)) blur(0.5px)' 
                        : 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15)) blur(0.2px)',
                      transition: 'all 0.3s ease',
                      cursor: isInteractive ? 'pointer' : 'default',
                      backdropFilter: 'blur(1px)'
                    }}
                  />
                  
                  {/* Glass highlight effect */}
                  {isInteractive && (
                    <rect
                      x={house.x - size/2 + 1}
                      y={house.y - size/2 + 1}
                      width={size - 2}
                      height={size/3}
                      fill="white"
                      fillOpacity={isHovered ? 0.3 : 0.2}
                      rx="2"
                      style={{
                        transition: 'all 0.3s ease'
                      }}
                    />
                  )}
                  
                  {/* Glass Energy Flow Indicators - only for interactive houses */}
                  {isInteractive && data && data.pv > 0 && (
                    <circle
                      cx={house.x}
                      cy={house.y - size/2 - 8}
                      r="3"
                      fill="#34D399"
                      fillOpacity="0.8"
                      stroke="white"
                      strokeWidth="1"
                      strokeOpacity="0.6"
                      className="animate-pulse"
                      style={{
                        filter: 'drop-shadow(0 0 6px rgba(52, 211, 153, 0.5))'
                      }}
                    />
                  )}
                  
                  {isInteractive && data && data.share > 0 && (
                    <circle
                      cx={house.x + size/2 + 4}
                      cy={house.y}
                      r="2"
                      fill="#60A5FA"
                      fillOpacity="0.8"
                      stroke="white"
                      strokeWidth="1"
                      strokeOpacity="0.6"
                      className="animate-pulse"
                      style={{
                        filter: 'drop-shadow(0 0 4px rgba(96, 165, 250, 0.5))'
                      }}
                    />
                  )}
                  
                  {isInteractive && data && data.imp > 0 && (
                    <circle
                      cx={house.x - size/2 - 4}
                      cy={house.y}
                      r="2"
                      fill="#F87171"
                      fillOpacity="0.8"
                      stroke="white"
                      strokeWidth="1"
                      strokeOpacity="0.6"
                      className="animate-pulse"
                      style={{
                        filter: 'drop-shadow(0 0 4px rgba(248, 113, 113, 0.5))'
                      }}
                    />
                  )}
                </g>
              );
            })}
          </svg>
          
          {/* Error Banner */}
          {mapError && (
            <div className="absolute top-4 right-4 bg-red-100/90 text-red-700 px-3 py-2 rounded-lg text-sm border border-red-300/50 z-30">
              {mapError}
            </div>
          )}

          {/* Warning Banner */}
          {mapWarning && (
            <div className="absolute top-4 left-4 bg-yellow-100/90 text-yellow-700 px-3 py-2 rounded-lg text-sm border border-yellow-300/50 z-30">
              {mapWarning}
            </div>
          )}

          {/* Safe Hover Tooltip */}
          {hoveredHouse && (() => {
            const house = housePositions.find(h => h.id === hoveredHouse);
            if (!house) return null;
            
            // Smart positioning to avoid edges
            const containerWidth = mapContainer?.clientWidth || 800;
            const containerHeight = mapContainer?.clientHeight || 600;
            const tooltipWidth = 220;
            const tooltipHeight = 200;
            
            let left = house.x * 0.8 + 40;
            let top = house.y * 0.8 - 120;
            
            // Adjust if too far right
            if (left + tooltipWidth > containerWidth) {
              left = house.x * 0.8 - tooltipWidth - 20;
            }
            
            // Adjust if too far up
            if (top < 20) {
              top = house.y * 0.8 + 40;
            }
            
            return (
              <div
                className="absolute bg-white/95 backdrop-blur-md text-gray-800 p-4 rounded-xl shadow-2xl border border-gray-200/50 z-20 pointer-events-none"
                style={{
                  left: `${Math.max(20, Math.min(left, containerWidth - tooltipWidth - 20))}px`,
                  top: `${Math.max(20, Math.min(top, containerHeight - tooltipHeight - 20))}px`,
                  maxWidth: '220px',
                  minWidth: '180px'
                }}
              >
                <SafeTooltip houseId={hoveredHouse} />
              </div>
            );
          })()}
          
          {/* Integrated Map Legend */}
          <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm rounded-lg p-4 text-gray-800 text-sm border border-gray-200/50 shadow-lg max-w-xs">
            <div className="text-sm font-bold mb-3 text-gray-900 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Sunset Ridge Microgrid
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded" style={{backgroundColor: '#34D399', opacity: 0.9}}></div>
                <span className="text-sm font-medium">Producing (PV)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded" style={{backgroundColor: '#60A5FA', opacity: 0.9}}></div>
                <span className="text-sm font-medium">Sharing Energy</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded" style={{backgroundColor: '#F87171', opacity: 0.9}}></div>
                <span className="text-sm font-medium">Importing</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full animate-pulse" style={{backgroundColor: '#34D399', opacity: 0.9}}></div>
                <span className="text-sm font-medium">Active Energy Flow</span>
              </div>
            </div>
            <div className="text-xs text-gray-600 mt-3 pt-2 border-t border-gray-200">
              White/Yellow houses are not part of the microgrid
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InteractiveMap;
