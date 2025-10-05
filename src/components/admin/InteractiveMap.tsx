import { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Zap, Battery, TrendingUp, TrendingDown } from 'lucide-react';

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
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = useCallback((houseId: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredHouse(houseId);
  }, []);

  const handleMouseLeave = useCallback(() => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredHouse(null);
    }, 100);
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

  const getHouseData = (houseId: string) => {
    // Convert family name to simulation ID
    const simId = familyToSimId[houseId];
    if (!simId) return null;
    
    return homes.find(home => home.id === simId);
  };

  const getHouseColor = (house: HousePosition) => {
    const data = getHouseData(house.id);
    if (!data) return '#94A3B8'; // Soft gray for no data

    // Soft, translucent colors for glass-like effect
    if (data.pv > 0) return '#34D399'; // Soft green for producing
    if (data.share > 0) return '#60A5FA'; // Soft blue for sharing
    if (data.imp > 0) return '#F87171'; // Soft red for importing
    return '#60A5FA'; // Soft blue for neutral
  };

  const getHouseBorderColor = (house: HousePosition) => {
    const data = getHouseData(house.id);
    if (!data) return '#CBD5E1';

    // Soft border colors based on SOC
    if (data.soc > 60) return '#34D399'; // Soft green
    if (data.soc > 30) return '#FBBF24'; // Soft yellow
    return '#F87171'; // Soft red
  };

  const getHouseSize = (house: HousePosition) => {
    const data = getHouseData(house.id);
    if (!data) return 16;

    // Size based on total power (PV + Load)
    const totalPower = data.pv + data.load;
    if (totalPower > 5) return 20;
    if (totalPower > 3) return 18;
    return 16;
  };

  return (
    <Card className="bg-white dark:bg-gray-900 border-2 border-green-600 dark:border-green-400 shadow-[0_0_0_1px_rgba(34,197,94,0.1)] hover:shadow-[0_0_0_1px_rgba(34,197,94,0.2)] transition-all duration-200">
      <CardHeader>
        <div className="flex items-center gap-3">
          <MapPin className="h-6 w-6 text-green-600 dark:text-green-400" />
          <CardTitle className="text-2xl font-black text-gray-800 dark:text-white">Sunset Ridge Community</CardTitle>
        </div>
        <CardDescription className="text-base text-gray-600 dark:text-gray-300 font-medium">
          Real-time microgrid energy monitoring
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative rounded-lg overflow-hidden" style={{ height: '600px' }}>
          {/* Map Background */}
          <img
            src="/map.png"
            alt="Lenah Mill Community Map"
            className="absolute inset-0 w-full h-full object-contain"
            style={{ opacity: 0.9 }}
          />
          
          {/* Interactive SVG Overlay */}
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 1000 800"
            className="absolute inset-0"
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
              
              return (
                <g key={house.id}>
                  {/* Interactive hit area - only for blue houses */}
                  {isInteractive && (
                    <rect
                      x={house.x - size}
                      y={house.y - size}
                      width={size * 2}
                      height={size * 2}
                      fill="transparent"
                      onMouseEnter={() => handleMouseEnter(house.id)}
                      onMouseLeave={handleMouseLeave}
                      style={{ cursor: 'pointer' }}
                    />
                  )}
                  
                  {/* Sharp Modern House Rectangle */}
                  <rect
                    x={house.x - size/2}
                    y={house.y - size/2}
                    width={size}
                    height={size}
                    fill={getHouseColor(house)}
                    stroke={isInteractive ? '#22c55e' : '#6b7280'}
                    strokeWidth={isHovered && isInteractive ? 3 : 2}
                    rx="0"
                    fillOpacity={isHovered && isInteractive ? 0.9 : 0.7}
                    strokeOpacity={isHovered && isInteractive ? 1.0 : 0.8}
                    style={{
                      filter: isHovered && isInteractive
                        ? 'drop-shadow(0 0 16px rgba(34, 197, 94, 0.6))' 
                        : 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.25))',
                      transition: 'all 0.2s ease',
                      cursor: isInteractive ? 'pointer' : 'default'
                    }}
                  />
                  
                  {/* Sharp Modern highlight effect */}
                  {isInteractive && (
                    <rect
                      x={house.x - size/2 + 2}
                      y={house.y - size/2 + 2}
                      width={size - 4}
                      height={size/4}
                      fill="#22c55e"
                      fillOpacity={isHovered ? 0.4 : 0.2}
                      rx="0"
                      style={{
                        transition: 'all 0.2s ease'
                      }}
                    />
                  )}
                  
                  {/* Sharp Modern Energy Flow Indicators - only for interactive houses */}
                  {isInteractive && data && data.pv > 0 && (
                    <rect
                      x={house.x - 4}
                      y={house.y - size/2 - 10}
                      width="8"
                      height="8"
                      fill="#22c55e"
                      fillOpacity="0.9"
                      stroke="#ffffff"
                      strokeWidth="2"
                      strokeOpacity="0.8"
                      className="animate-pulse"
                      style={{
                        filter: 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.7))'
                      }}
                    />
                  )}
                  
                  {isInteractive && data && data.share > 0 && (
                    <rect
                      x={house.x + size/2 + 2}
                      y={house.y - 4}
                      width="6"
                      height="6"
                      fill="#3b82f6"
                      fillOpacity="0.9"
                      stroke="#ffffff"
                      strokeWidth="2"
                      strokeOpacity="0.8"
                      className="animate-pulse"
                      style={{
                        filter: 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.7))'
                      }}
                    />
                  )}
                  
                  {isInteractive && data && data.imp > 0 && (
                    <rect
                      x={house.x - size/2 - 8}
                      y={house.y - 4}
                      width="6"
                      height="6"
                      fill="#ef4444"
                      fillOpacity="0.9"
                      stroke="#ffffff"
                      strokeWidth="2"
                      strokeOpacity="0.8"
                      className="animate-pulse"
                      style={{
                        filter: 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.7))'
                      }}
                    />
                  )}
                </g>
              );
            })}
          </svg>
          
          {/* Hover Tooltip - Only for Interactive Houses */}
          {hoveredHouse && (() => {
            const house = housePositions.find(h => h.id === hoveredHouse);
            if (!house || house.type !== 'house') return null; // Only show tooltip for blue houses
            
            return (
              <div
                className="absolute bg-white dark:bg-gray-900 backdrop-blur-md text-gray-800 dark:text-white p-5 shadow-2xl border-2 border-green-600 dark:border-green-400 z-20 pointer-events-none"
                style={{
                  left: `${Math.min(house.x * 0.8 + 40, 500)}px`,
                  top: `${Math.max(house.y * 0.8 - 120, 20)}px`,
                  maxWidth: '240px',
                  minWidth: '200px'
                }}
              >
              {(() => {
                const data = getHouseData(hoveredHouse);
                if (!data) return <div>No data available</div>;
                
                return (
                  <div className="space-y-4">
                    <div className="font-black text-lg text-gray-800 dark:text-white border-b-2 border-green-600 dark:border-green-400 pb-3 flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-600 dark:bg-green-400"></div>
                      {hoveredHouse} Family
                    </div>
                    
                    <div className="space-y-3 text-base">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 dark:text-gray-300 flex items-center gap-2 font-medium">
                          <Zap className="h-4 w-4 text-green-600 dark:text-green-400" />
                          PV:
                        </span>
                        <span className="font-mono text-green-600 dark:text-green-400 font-black">{data.pv} kW</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 dark:text-gray-300 flex items-center gap-2 font-medium">
                          <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-400" />
                          Load:
                        </span>
                        <span className="font-mono text-gray-800 dark:text-white font-black">{data.load} kW</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 dark:text-gray-300 flex items-center gap-2 font-medium">
                          <Battery className="h-4 w-4 text-green-600 dark:text-green-400" />
                          SOC:
                        </span>
                        <span className="font-mono text-gray-800 dark:text-white font-black">{data.soc}%</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 dark:text-gray-300 flex items-center gap-2 font-medium">
                          <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                          Import:
                        </span>
                        <span className="font-mono text-red-600 dark:text-red-400 font-black">{data.imp.toFixed(2)} kW</span>
                      </div>
                      
                      {data.share > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 dark:text-gray-300 flex items-center gap-2 font-medium">
                            <div className="w-3 h-3 bg-green-600 dark:bg-green-400"></div>
                            Sharing:
                          </span>
                          <span className="font-mono text-green-600 dark:text-green-400 font-black">{data.share.toFixed(2)} kW</span>
                        </div>
                      )}
                      
                      {data.recv > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 dark:text-gray-300 flex items-center gap-2 font-medium">
                            <div className="w-3 h-3 bg-blue-600 dark:bg-blue-400"></div>
                            Receiving:
                          </span>
                          <span className="font-mono text-blue-600 dark:text-blue-400 font-black">{data.recv.toFixed(2)} kW</span>
                        </div>
                      )}
                      
                      {data.exp > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 dark:text-gray-300 flex items-center gap-2 font-medium">
                            <div className="w-3 h-3 bg-purple-600 dark:bg-purple-400"></div>
                            Exporting:
                          </span>
                          <span className="font-mono text-purple-600 dark:text-purple-400 font-black">{data.exp.toFixed(2)} kW</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
              </div>
            );
          })()}
          
          {/* Sharp Modern Integrated Map Legend */}
          <div className="absolute bottom-6 left-6 bg-white dark:bg-gray-900 backdrop-blur-sm p-5 text-gray-800 dark:text-white text-base border-2 border-green-600 dark:border-green-400 shadow-2xl max-w-sm">
            <div className="text-base font-black mb-4 text-gray-800 dark:text-white flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-green-600 dark:border-green-400 bg-green-600 dark:bg-green-400"></div>
              Sunset Ridge Microgrid
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-5 h-5 border-2 border-green-600 dark:border-green-400" style={{backgroundColor: '#22c55e', opacity: 0.9}}></div>
                <span className="text-base font-black text-gray-800 dark:text-white">Producing (PV)</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-5 h-5 border-2 border-blue-600 dark:border-blue-400" style={{backgroundColor: '#3b82f6', opacity: 0.9}}></div>
                <span className="text-base font-black text-gray-800 dark:text-white">Sharing Energy</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-5 h-5 border-2 border-red-600 dark:border-red-400" style={{backgroundColor: '#ef4444', opacity: 0.9}}></div>
                <span className="text-base font-black text-gray-800 dark:text-white">Importing</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 border-2 border-green-600 dark:border-green-400 animate-pulse" style={{backgroundColor: '#22c55e', opacity: 0.9}}></div>
                <span className="text-base font-black text-gray-800 dark:text-white">Active Energy Flow</span>
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-4 pt-3 border-t-2 border-green-600 dark:border-green-400 font-medium">
              White/Yellow houses are not part of the microgrid
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InteractiveMap;
