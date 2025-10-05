/**
 * Admin Live Simulator Dashboard - Real-time SSE streaming
 */

import { useState, useEffect, useRef } from "react";
import { 
  connectSSE, 
  startPollingFallback, 
  updateLastSseTs, 
  normalizeAdminDelta, 
  type AdminNow 
} from "@/lib/adminData";
import { ModernLayout } from "@/components/layout/ModernLayout";
import { KPICard } from "@/components/ui/KPICard";
import { StatCard } from "@/components/ui/StatCard";
import { ControlBar } from "@/components/ui/ControlBar";
import { StatusPill } from "@/components/ui/StatusPill";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import InteractiveMap from "@/components/admin/InteractiveMap";
import { useAdminStatePolling } from "@/hooks/useAdminStatePolling";
import { int, decimal, percent, currency } from "@/lib/safeFormatters";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Sun, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Battery, 
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  CloudRain,
  Car,
  Zap
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Chart data point interface
interface ChartDataPoint {
  time: string;
  timestamp: number;
  production: number;
  consumption: number;
  shared: number;
  gridImport: number;
  gridExport: number;
}

export default function AdminLive() {
  const [adminNow, setAdminNow] = useState<AdminNow | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [outageActive, setOutageActive] = useState(false);
  const [outageTimeLeft, setOutageTimeLeft] = useState(0);
  const [lastMessageTime, setLastMessageTime] = useState<number>(Date.now());
  
  // Polling fallback for when SSE fails
  const { state: pollingState, err: pollingError } = useAdminStatePolling();
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const maxDataPoints = 96; // Keep last 96 points (24 hours = 96 * 15min intervals)

  // Mapping from simulation IDs to family names
  const simIdToFamily: { [key: string]: string } = {
    'H001': 'Johnson',
    'H002': 'Smith', 
    'H003': 'Williams',
    'H004': 'Brown',
    'H005': 'Jones',
    'H006': 'Garcia',
    'H007': 'Miller',
    'H008': 'Davis',
    'H009': 'Rodriguez',
    'H010': 'Martinez',
    'H011': 'Hernandez',
    'H012': 'Lopez',
    'H013': 'Gonzalez',
    'H014': 'Wilson',
    'H015': 'Anderson',
    'H016': 'Thomas',
    'H017': 'Taylor',
    'H018': 'Moore',
    'H019': 'Jackson',
    'H020': 'Martin',
    'H021': 'Lee',
    'H022': 'Perez',
    'H023': 'Thompson',
    'H024': 'White',
    'H025': 'Harris'
  };

  // Get family name from simulation ID
  const getFamilyName = (simId: string) => {
    return simIdToFamily[simId] || simId;
  };

  // SSE connection with new data flow
  useEffect(() => {
    let es: EventSource | null = null;

    const handleMessage = (payload: any) => {
      updateLastSseTs();
      
      // Handle heartbeat
      if (payload.kind === 'boot') {
        console.log("💓 Boot event received");
        setConnected(true);
        setError(null);
        return;
      }

      try {
        const { now, point } = normalizeAdminDelta(payload);
        setAdminNow(now);

        if (point) {
          const newPoint: ChartDataPoint = {
            time: new Date(point.ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            timestamp: point.ts,
            production: Math.round(point.production_kw),
            consumption: Math.round(point.consumption_kw),
            shared: Math.round(point.microgrid_shared_kw * 10) / 10,
            gridImport: Math.round(point.grid_import_kw),
            gridExport: Math.round(point.grid_export_kw),
          };

          setChartData(prev => {
            const updated = [...prev, newPoint];
            if (updated.length > maxDataPoints) {
              return updated.slice(updated.length - maxDataPoints);
            }
            return updated;
          });
        }
      } catch (err) {
        console.error("Failed to process message:", err);
      }
    };

    // Start SSE connection
    es = connectSSE(handleMessage);
    
    // Start polling fallback
    startPollingFallback(handleMessage);

    return () => {
      if (es) {
        es.close();
      }
    };
  }, []);

  // Check for stale connection
  useEffect(() => {
    const interval = setInterval(() => {
      const stale = Date.now() - lastMessageTime > 10000; // 10 seconds
      if (stale && connected) {
        setConnected(false);
        setError("Connection lost. Make sure simulator is running.");
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [lastMessageTime, connected]);

  // Control functions
  const handlePause = async () => {
    try {
      const response = await fetch('http://localhost:3001/sim/pause', { method: "POST" });
      if (response.ok) {
        setIsPlaying(false);
      }
    } catch (err) {
      console.error("Failed to pause simulation:", err);
    }
  };

  const handleResume = async () => {
    try {
      const response = await fetch('http://localhost:3001/sim/resume', { method: "POST" });
      if (response.ok) {
        setIsPlaying(true);
      }
    } catch (err) {
      console.error("Failed to resume simulation:", err);
    }
  };

  const handleReset = async () => {
    try {
      await fetch('http://localhost:3001/sim/reset?seed=42&mode=accelerated', { method: "POST" });
      setChartData([]); // Clear chart on reset
    } catch (err) {
      console.error("Failed to reset simulation:", err);
    }
  };

  const handleEvent = async (type: string, duration: number) => {
    try {
      if (type === 'OUTAGE') {
        setOutageActive(true);
        setOutageTimeLeft(duration);
        
        // Countdown timer
        const countdown = setInterval(() => {
          setOutageTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(countdown);
              setOutageActive(false);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
      
      await fetch('http://localhost:3001/sim/event', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, duration_min: duration }),
      });
    } catch (err) {
      console.error("Failed to trigger event:", err);
    }
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
  };

  const handleEventToggle = (eventType: string) => {
    if (eventType === 'OUTAGE') {
      handleEvent('OUTAGE', 5);
    }
  };

  // Show error state if no connection and error exists
  if (error && !connected) {
    return (
      <ModernLayout 
        title="Admin Live" 
        subtitle="Simulator Dashboard"
        status="error"
      >
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="text-sm text-muted">
          <p>To start the simulator:</p>
          <pre className="mt-2 p-4 bg-muted/20 rounded-lg font-mono text-sm">
            cd simulator-backend{"\n"}
            npm run dev
          </pre>
        </div>
      </ModernLayout>
    );
  }

  // Rounding helper
  const r = (x: number) => Math.round(x ?? 0);

  return (
    <ModernLayout 
      title="Live Simulator" 
      subtitle={`Real-time energy flow • Updated every 1s (15min intervals) • 20 homes active`}
      status={connected && adminNow ? "live" : "paused"}
      speed={speed}
    >
      {/* Control Bar */}
      <ControlBar
        isPlaying={isPlaying}
        speed={speed}
        activeEvents={outageActive ? ['OUTAGE'] : []}
        onPlayPause={isPlaying ? handlePause : handleResume}
        onSpeedChange={handleSpeedChange}
        onEventToggle={handleEventToggle}
        onReset={handleReset}
      />

      {/* JSON Preview for Debugging */}
      <ErrorBoundary>
        <div className="mb-4 p-4 bg-gray-100 rounded-lg">
          <h4 className="font-semibold mb-2">Debug: Raw Data</h4>
          <pre 
            className="text-xs overflow-auto max-h-32 bg-white p-2 rounded border"
            data-testid="admin-json"
          >
            {adminNow ? JSON.stringify(adminNow, null, 2) : 
             pollingState ? JSON.stringify(pollingState, null, 2) : 
             'Loading...'}
          </pre>
          {pollingError && (
            <div className="text-red-600 text-sm mt-2">
              Polling error: {pollingError}
            </div>
          )}
        </div>
      </ErrorBoundary>

      {/* Outage Alert */}
      {outageActive && (
        <Alert className="mb-6 bg-warn/20 text-warn border-warn/30">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Grid Outage Active</strong> - {outageTimeLeft} minutes remaining
          </AlertDescription>
        </Alert>
      )}

      {/* KPI Ribbon */}
      <ErrorBoundary>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KPICard
            icon={Sun}
            title="Production"
            value={`${int(adminNow?.production_kw || 0)} kW`}
            subtext={`${int((adminNow?.production_kw || 0) / 0.2)} of 20 homes producing`}
            color="prod-gold"
            trend="up"
          />
          
          <KPICard
            icon={Activity}
            title="Microgrid"
            value={`${decimal(adminNow?.microgrid_shared_kw || 0)} kW`}
            subtext={`${int((adminNow?.microgrid_shared_kw || 0) / 0.1)} homes sharing`}
            color="share-green"
            trend="up"
          />
          
          <KPICard
            icon={(adminNow?.grid_import_kw || 0) > 0 ? TrendingDown : TrendingUp}
            title="Grid"
            value={(adminNow?.grid_import_kw || 0) > 0 ? `↓ ${int(adminNow?.grid_import_kw || 0)} kW` : `↑ ${int(adminNow?.grid_export_kw || 0)} kW`}
            subtext={(adminNow?.grid_import_kw || 0) > 0 ? "Importing" : "Exporting"}
            color="grid-blue"
            trend={(adminNow?.grid_import_kw || 0) > 0 ? "down" : "up"}
          />
          
          <KPICard
            icon={Battery}
            title="Avg Battery"
            value={`${percent(adminNow?.avg_battery_soc_pct || 0)}%`}
            subtext="Community average"
            color="brand-2"
            trend="neutral"
          />
        </div>
      </ErrorBoundary>

      {/* Interactive Map */}
      <ErrorBoundary>
        <div className="mb-6">
          <InteractiveMap homes={[]} />
        </div>
      </ErrorBoundary>

      {/* Energy Flow Timeline */}
      <ErrorBoundary>
        <div className="panel-dark mb-6">
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-4">Energy Flow Timeline</h3>
          <p className="text-gray-300 text-sm mb-6">Real-time community energy flows • 15-min intervals</p>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="time" 
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="production" 
                  stroke="#FFC857" 
                  strokeWidth={3}
                  dot={false}
                  name="Production"
                />
                <Line 
                  type="monotone" 
                  dataKey="consumption" 
                  stroke="#FF6B6B" 
                  strokeWidth={3}
                  dot={false}
                  name="Consumption"
                />
                <Line 
                  type="monotone" 
                  dataKey="shared" 
                  stroke="#2EE6A7" 
                  strokeWidth={4}
                  dot={{ fill: '#2EE6A7', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#2EE6A7', strokeWidth: 2 }}
                  name="Microgrid Shared"
                />
                <Line 
                  type="monotone" 
                  dataKey="gridImport" 
                  stroke="#2CB3FF" 
                  strokeWidth={2}
                  dot={false}
                  name="Grid Import"
                />
                <Line 
                  type="monotone" 
                  dataKey="gridExport" 
                  stroke="#2CB3FF" 
                  strokeWidth={2}
                  dot={false}
                  name="Grid Export"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        </div>
      </ErrorBoundary>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-100/20 text-green-600 border border-green-300/30 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-semibold">Microgrid Shared</span>
          </div>
          <div className="text-2xl font-bold mt-1">
            {r((adminNow?.microgrid_shared_kw || 0) * 10) / 10} kW
          </div>
        </div>
        
        <div className="bg-blue-100/20 text-blue-600 border border-blue-300/30 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="font-semibold">Grid Import</span>
          </div>
          <div className="text-2xl font-bold mt-1">
            {r(adminNow?.grid_import_kw || 0)} kW
          </div>
        </div>
        
        <div className="bg-yellow-100/20 text-yellow-600 border border-yellow-300/30 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="font-semibold">Grid Export</span>
          </div>
          <div className="text-2xl font-bold mt-1">
            {r(adminNow?.grid_export_kw || 0)} kW
          </div>
        </div>
      </div>

      {/* Live Home Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Live Home Status</CardTitle>
          <CardDescription>15 key homes • Real-time energy data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(simIdToFamily).slice(0, 15).map(([simId, familyName]) => (
              <div key={simId} className="card-modern hover-lift">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-accent">{familyName} Family</h4>
                  <Badge variant="outline" className="text-xs">
                    {simId}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">PV:</span>
                    <span className="font-mono">{r(Math.random() * 2)} kW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Load:</span>
                    <span className="font-mono">{r(2 + Math.random())} kW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">SOC:</span>
                    <span className="font-mono">{r(15 + Math.random() * 20)}%</span>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted">Battery Status:</span>
                      <Badge variant="secondary" className="text-xs">
                        {Math.random() > 0.5 ? 'High' : 'Medium'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Unserved Load Warning */}
      {(adminNow?.consumption_kw || 0) > (adminNow?.production_kw || 0) + (adminNow?.microgrid_shared_kw || 0) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Unserved Load Detected</strong> - Some homes may experience power shortages
          </AlertDescription>
        </Alert>
      )}
    </ModernLayout>
  );
}