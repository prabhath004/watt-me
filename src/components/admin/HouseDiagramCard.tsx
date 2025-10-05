import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sun, Home, Battery, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import type { HomeLatest } from '@/hooks/useAdminData';
import { formatKw, formatPercent } from '@/lib/formatters';

interface HouseDiagramCardProps {
  home: HomeLatest;
}

export function HouseDiagramCard({ home }: HouseDiagramCardProps) {
  const pvNow = Math.round(home.pv_w / 1000);
  const isExporting = home.grid_export_w > 500;
  const isImporting = home.grid_import_w > 500;

  return (
    <Card className="p-5 bg-gradient-card rounded-2xl shadow-card hover:shadow-glow transition-all duration-200">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Left: House SVG Diagram (60%) */}
        <div className="flex-[3] relative">
          <svg viewBox="0 0 200 180" className="w-full h-auto">
            {/* House base */}
            <path
              d="M 40 90 L 100 50 L 160 90 L 160 150 L 40 150 Z"
              fill="#0F141A"
              stroke="#1C2430"
              strokeWidth="2"
            />
            {/* Roof */}
            <path
              d="M 30 90 L 100 40 L 170 90 L 160 90 L 100 50 L 40 90 Z"
              fill="#121925"
              stroke="#1C2430"
              strokeWidth="2"
            />
            {/* Solar panels on roof */}
            <rect
              x="80"
              y="55"
              width="40"
              height="25"
              fill={pvNow > 0 ? 'url(#solarGlow)' : '#1C2430'}
              stroke="#22D3EE"
              strokeWidth={pvNow > 0 ? '2' : '1'}
              opacity={pvNow > 0 ? '1' : '0.5'}
            />
            
            {/* Window */}
            <rect x="70" y="105" width="20" height="25" fill="#1C2430" stroke="#2B2F37" strokeWidth="1" />
            <rect x="110" y="105" width="20" height="25" fill="#1C2430" stroke="#2B2F37" strokeWidth="1" />
            
            {/* Battery pack */}
            <rect x="145" y="110" width="10" height="30" fill="#0F141A" stroke="#1BD18A" strokeWidth="2" />
            <rect
              x="145"
              y={110 + (30 * (100 - home.soc_pct) / 100)}
              width="10"
              height={30 * home.soc_pct / 100}
              fill="#1BD18A"
              opacity="0.7"
            />
            
            {/* Grid connection port (right side) */}
            <circle
              cx="170"
              cy="120"
              r="5"
              fill={isExporting ? '#6BA8FF' : isImporting ? '#F05252' : '#2B2F37'}
              stroke={isExporting ? '#6BA8FF' : isImporting ? '#F05252' : '#2B2F37'}
              strokeWidth="2"
            />

            {/* Gradients */}
            <defs>
              <radialGradient id="solarGlow">
                <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#1C2430" stopOpacity="0.3" />
              </radialGradient>
            </defs>

            {/* Callout: Solar */}
            <g>
              <Sun className="w-4 h-4" x="95" y="28" fill="#22D3EE" stroke="#22D3EE" />
              <text x="100" y="25" fill="#22D3EE" fontSize="11" fontWeight="600" textAnchor="middle">
                {formatKw(pvNow)} kW
              </text>
            </g>

            {/* Callout: Home consumption */}
            <g>
              <text x="100" y="95" fill="#F6A723" fontSize="11" fontWeight="600" textAnchor="middle">
                {formatKw(Math.round(home.load_w / 1000))} kW
              </text>
            </g>

            {/* Callout: Battery */}
            <g>
              <text x="150" y="105" fill="#1BD18A" fontSize="10" fontWeight="600" textAnchor="middle">
                {formatPercent(home.soc_pct)}%
              </text>
            </g>

            {/* Callout: Grid arrow */}
            {isExporting && (
              <g>
                <text x="175" y="115" fill="#6BA8FF" fontSize="10" fontWeight="600">
                  → {formatKw(Math.round(home.grid_export_w / 1000))}
                </text>
              </g>
            )}
            {isImporting && (
              <g>
                <text x="175" y="115" fill="#F05252" fontSize="10" fontWeight="600">
                  ← {formatKw(Math.round(home.grid_import_w / 1000))}
                </text>
              </g>
            )}
          </svg>

          {/* House ID badge at top */}
          <div className="absolute top-0 left-0">
            <Badge variant="outline" className="font-semibold border-border bg-card/80 backdrop-blur">
              {home.home_id}
            </Badge>
          </div>
        </div>

        {/* Right: KPIs Column (40%) */}
        <div className="flex-[2] flex flex-col justify-center space-y-3">
          {/* Current State */}
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Solar / Load</p>
            <p className="text-lg font-semibold tabular-nums">
              {formatKw(pvNow)} / {formatKw(Math.round(home.load_w / 1000))} kW
            </p>
          </div>

          {/* Sharing */}
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Grid Sharing</p>
            <p className="text-lg font-semibold text-surplus tabular-nums">
              {formatKw(Math.round(home.sharing_w / 1000))} kW
            </p>
          </div>

          {/* Grid state badge */}
          {isExporting && (
            <Badge variant="outline" className="border-grid-export text-grid-export bg-grid-export/10 w-fit">
              <ArrowUpRight className="mr-1 h-3 w-3" />
              Exporting
            </Badge>
          )}
          {isImporting && (
            <Badge variant="outline" className="border-grid-import text-grid-import bg-grid-import/10 w-fit">
              <ArrowDownLeft className="mr-1 h-3 w-3" />
              Importing
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
