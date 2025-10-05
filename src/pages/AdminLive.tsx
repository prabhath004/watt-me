/**
 * Admin Live Simulator Dashboard - Real-time SSE streaming
 */

import { useState, useEffect, useRef } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import InteractiveMap from "@/components/admin/InteractiveMap";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, Activity, Battery, TrendingUp, TrendingDown, Play, Pause, RotateCcw, CloudRain, Flame, Car, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

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
  credits_balance_kwh?: number;
  savings_usd?: number;
}

interface SSEData {
  ts: string;
  homes: SSEHome[];
  grid: { imp: number; exp: number };
  community: { prod: number; mg_used: number; unserved: number; savings_usd?: number };
}

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
  const [liveData, setLiveData] = useState<SSEData | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [outageActive, setOutageActive] = useState(false);
  const [outageTimeLeft, setOutageTimeLeft] = useState(0);
  const maxDataPoints = 96; // Keep last 96 points (24 hours = 96 * 15min intervals)

  // Mapping from simulation IDs to family names
  const simIdToFamily: { [key: string]: string } = {
    'H001': 'Johnson',
    'H002': 'Smith', 
    'H003': 'Williams',
    'H004': 'Brown',
    'H005': 'Davis',
    'H006': 'Miller',
    'H007': 'Wilson',
    'H008': 'Moore',
    'H009': 'Taylor',
    'H010': 'Anderson',
    'H011': 'Garcia',
    'H012': 'Martinez',
    'H013': 'Rodriguez',
    'H014': 'Lopez',
    'H015': 'Gonzalez',
    'H016': 'Flores',
    'H017': 'Rivera',
    'H018': 'Cooper',
    'H019': 'Reed',
    'H020': 'Cook',
    'H021': 'Bailey',
    'H022': 'Murphy',
    'H023': 'Kelly',
    'H024': 'Howard',
    'H025': 'Ward'
  };

  // Get family name from simulation ID
  const getFamilyName = (simId: string) => {
    return simIdToFamily[simId] || simId;
  };

  // Connect to SSE stream
  useEffect(() => {
    const baseUrl = import.meta.env.VITE_SIM_API_URL as string;
    const es = new EventSource(`${baseUrl}/stream`);

    es.onopen = () => {
      console.log("✅ Connected to live simulator");
      setConnected(true);
      setError(null);
    };

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLiveData(data);

        // Add to chart data
        const time = new Date(data.ts);
        const totalConsumption = data.homes.reduce((sum: number, h: SSEHome) => sum + h.load, 0);
        
        const newPoint: ChartDataPoint = {
          time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          timestamp: time.getTime(),
          production: Math.round(data.community.prod),
          consumption: Math.round(totalConsumption),
          shared: Math.round(data.community.mg_used * 10) / 10,
          gridImport: Math.round(data.grid.imp),
          gridExport: Math.round(data.grid.exp),
        };

        setChartData(prev => {
          const updated = [...prev, newPoint];
          // Keep only last N points
          if (updated.length > maxDataPoints) {
            return updated.slice(updated.length - maxDataPoints);
          }
          return updated;
        });
      } catch (err) {
        console.error("Failed to parse SSE data:", err);
      }
    };

    es.onerror = (err) => {
      console.error("SSE connection error:", err);
      setConnected(false);
      setError("Connection lost. Check simulator backend URL.");
    };

    setEventSource(es);

    return () => {
      es.close();
    };
  }, []);

  // Control functions
  const handlePause = async () => {
    const baseUrl = import.meta.env.VITE_SIM_API_URL as string;
    await fetch(`${baseUrl}/sim/pause`, { method: "POST" });
  };

  const handleResume = async () => {
    const baseUrl = import.meta.env.VITE_SIM_API_URL as string;
    await fetch(`${baseUrl}/sim/resume`, { method: "POST" });
  };

  const handleReset = async () => {
    const baseUrl = import.meta.env.VITE_SIM_API_URL as string;
    await fetch(`${baseUrl}/sim/reset?seed=42&mode=accelerated`, { method: "POST" });
    setChartData([]); // Clear chart on reset
  };

  const handleEvent = async (type: string, duration: number) => {
    if (type === "OUTAGE") {
      setOutageActive(true);
      setOutageTimeLeft(duration);
      
      // Start countdown timer
      const timer = setInterval(() => {
        setOutageTimeLeft(prev => {
          if (prev <= 1) {
            setOutageActive(false);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    const baseUrl = import.meta.env.VITE_SIM_API_URL as string;
    await fetch(`${baseUrl}/sim/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, duration_min: duration }),
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <AdminHeader microgridId="default" />
        <div className="max-w-7xl mx-auto p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4 text-sm text-muted-foreground">
            <p>To start the simulator:</p>
            <pre className="mt-2 p-4 bg-muted rounded">
              cd simulator-backend{"\n"}
              npm run dev
            </pre>
          </div>
        </div>
      </div>
    );
  }

  if (!liveData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 animate-pulse mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Connecting to live simulator...</p>
        </div>
      </div>
    );
  }

  const time = new Date(liveData.ts);
  const totalProducing = liveData.homes.filter(h => h.pv > 0).length;
  const totalSharing = liveData.homes.filter(h => h.share > 0).length;
  const avgSOC = Math.round(liveData.homes.reduce((sum, h) => sum + h.soc, 0) / liveData.homes.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900 dark:to-emerald-900">
      <AdminHeader microgridId="default" />

      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Sharp Modern Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black flex items-center gap-3 text-gray-800 dark:text-white tracking-tight">
              <Activity className={`h-10 w-10 ${connected ? "text-green-600 dark:text-green-400 animate-pulse" : "text-gray-400"}`} />
              Live Simulator
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-2 font-medium">
               Real-time energy flow • Updated every 1s (15min intervals) • 20 homes active
            </p>
          </div>
          <Badge variant={connected ? "default" : "secondary"} className="text-sm font-black bg-green-600 dark:bg-green-400 text-white dark:text-black border-2 border-green-600 dark:border-green-400">
            {connected ? "🟢 LIVE" : "⚫ Disconnected"}
          </Badge>
        </div>

        {/* Sharp Modern Time & Controls */}
        <Card className="bg-white dark:bg-gray-900 border-2 border-green-600 dark:border-green-400 shadow-[0_0_0_1px_rgba(34,197,94,0.1)] hover:shadow-[0_0_0_1px_rgba(34,197,94,0.2)] transition-all duration-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black text-gray-800 dark:text-white">Simulation Time</CardTitle>
                 <CardDescription className="text-base text-gray-600 dark:text-gray-300 font-medium">Virtual clock in accelerated mode (15 min = 1s)</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-4xl font-black font-mono text-gray-800 dark:text-white">
                  {time.toLocaleTimeString()}
                </div>
                <div className="text-base text-gray-600 dark:text-gray-300 font-medium">
                  {time.toLocaleDateString()}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 flex-wrap">
              <Button size="sm" onClick={handlePause} variant="outline" className="h-10 px-4 font-black border-2 border-green-600 dark:border-green-400 text-green-600 dark:text-green-400 hover:bg-green-600 dark:hover:bg-green-400 hover:text-white dark:hover:text-black transition-all duration-200">
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
              <Button size="sm" onClick={handleResume} variant="outline" className="h-10 px-4 font-black border-2 border-green-600 dark:border-green-400 text-green-600 dark:text-green-400 hover:bg-green-600 dark:hover:bg-green-400 hover:text-white dark:hover:text-black transition-all duration-200">
                <Play className="h-4 w-4 mr-2" />
                Resume
              </Button>
              <Button size="sm" onClick={handleReset} variant="outline" className="h-10 px-4 font-black border-2 border-green-600 dark:border-green-400 text-green-600 dark:text-green-400 hover:bg-green-600 dark:hover:bg-green-400 hover:text-white dark:hover:text-black transition-all duration-200">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <div className="border-l-2 border-green-600 dark:border-green-400 mx-3" />
              <Button size="sm" onClick={() => handleEvent("CLOUDBURST", 60)} variant="secondary" className="h-10 px-4 font-black bg-green-600 dark:bg-green-400 text-white dark:text-black border-2 border-green-600 dark:border-green-400 hover:bg-green-700 dark:hover:bg-green-300 hover:border-green-700 dark:hover:border-green-300 transition-all duration-200">
                <CloudRain className="h-4 w-4 mr-2" />
                Cloudburst (1h)
              </Button>
              <Button size="sm" onClick={() => handleEvent("HEATWAVE", 120)} variant="secondary" className="h-10 px-4 font-black bg-green-600 dark:bg-green-400 text-white dark:text-black border-2 border-green-600 dark:border-green-400 hover:bg-green-700 dark:hover:bg-green-300 hover:border-green-700 dark:hover:border-green-300 transition-all duration-200">
                <Flame className="h-4 w-4 mr-2" />
                Heatwave (2h)
              </Button>
              <Button size="sm" onClick={() => handleEvent("EV_SURGE", 240)} variant="secondary" className="h-10 px-4 font-black bg-green-600 dark:bg-green-400 text-white dark:text-black border-2 border-green-600 dark:border-green-400 hover:bg-green-700 dark:hover:bg-green-300 hover:border-green-700 dark:hover:border-green-300 transition-all duration-200">
                <Car className="h-4 w-4 mr-2" />
                EV Surge (4h)
              </Button>
              <Button 
                size="sm" 
                onClick={() => handleEvent("OUTAGE", 30)} 
                variant={outageActive ? "destructive" : "outline"}
                disabled={outageActive}
                className={`h-10 px-4 font-black border-2 transition-all duration-200 ${
                  outageActive 
                    ? "bg-red-600 dark:bg-red-400 text-white dark:text-black border-red-600 dark:border-red-400" 
                    : "border-green-600 dark:border-green-400 text-green-600 dark:text-green-400 hover:bg-green-600 dark:hover:bg-green-400 hover:text-white dark:hover:text-black"
                }`}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                {outageActive ? `Outage (${outageTimeLeft}m)` : "Outage (30m)"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Outage Alert */}
        {outageActive && (
          <Alert className="border-red-500 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-red-800">
              <strong>GRID OUTAGE ACTIVE</strong> - Community is operating on backup power. 
              Outage will end in {outageTimeLeft} minutes. 
              Microgrid sharing is critical during this time.
            </AlertDescription>
          </Alert>
        )}

        {/* Interactive Map */}
        <InteractiveMap homes={liveData.homes} />

        {/* Sharp Modern Live KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="bg-white dark:bg-gray-900 border-2 border-green-600 dark:border-green-400 shadow-[0_0_0_1px_rgba(34,197,94,0.1)] hover:shadow-[0_0_0_1px_rgba(34,197,94,0.2)] transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-black flex items-center gap-3 text-gray-800 dark:text-white">
                <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
                Production
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-gray-800 dark:text-white">{liveData.community.prod} kW</div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 font-medium">
                {totalProducing} of 20 homes producing
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900 border-2 border-green-600 dark:border-green-400 shadow-[0_0_0_1px_rgba(34,197,94,0.1)] hover:shadow-[0_0_0_1px_rgba(34,197,94,0.2)] transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-black flex items-center gap-3 text-gray-800 dark:text-white">
                <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
                Microgrid
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-gray-800 dark:text-white">{liveData.community.mg_used.toFixed(1)} kW</div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 font-medium">
                {totalSharing} homes sharing
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900 border-2 border-green-600 dark:border-green-400 shadow-[0_0_0_1px_rgba(34,197,94,0.1)] hover:shadow-[0_0_0_1px_rgba(34,197,94,0.2)] transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-black flex items-center gap-3 text-gray-800 dark:text-white">
                {liveData.grid.imp > 0 ? (
                  <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                ) : (
                  <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                )}
                Grid
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black">
                {liveData.grid.imp > 0 ? (
                  <span className="text-red-600 dark:text-red-400">↓ {liveData.grid.imp} kW</span>
                ) : (
                  <span className="text-blue-600 dark:text-blue-400">↑ {liveData.grid.exp} kW</span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 font-medium">
                {liveData.grid.imp > 0 ? "Importing" : "Exporting"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900 border-2 border-green-600 dark:border-green-400 shadow-[0_0_0_1px_rgba(34,197,94,0.1)] hover:shadow-[0_0_0_1px_rgba(34,197,94,0.2)] transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-black flex items-center gap-3 text-gray-800 dark:text-white">
                <Battery className="h-5 w-5 text-green-600 dark:text-green-400" />
                Avg Battery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-gray-800 dark:text-white">{avgSOC}%</div>
              <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 mt-3">
                <div
                  className="h-full bg-green-600 dark:bg-green-400 transition-all"
                  style={{ width: `${avgSOC}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900 border-2 border-green-600 dark:border-green-400 shadow-[0_0_0_1px_rgba(34,197,94,0.1)] hover:shadow-[0_0_0_1px_rgba(34,197,94,0.2)] transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-black flex items-center gap-3 text-gray-800 dark:text-white">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                $ Saved Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-green-600 dark:text-green-400">
                ${liveData.community.savings_usd?.toFixed(2) || '0.00'}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 font-medium">
                Community microgrid savings
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sharp Modern Real-Time Chart */}
        <Card className="bg-white dark:bg-gray-900 border-2 border-green-600 dark:border-green-400 shadow-[0_0_0_1px_rgba(34,197,94,0.1)] hover:shadow-[0_0_0_1px_rgba(34,197,94,0.2)] transition-all duration-200">
          <CardHeader>
            <CardTitle className="text-3xl font-black text-gray-800 dark:text-white tracking-tight">Complete Energy Flow Timeline</CardTitle>
              <CardDescription className="text-lg text-gray-600 dark:text-gray-300 font-medium">
                Live tracking of production, consumption, and shared energy (last {maxDataPoints} updates • 15-min intervals)
              </CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#22c55e" opacity={0.3} strokeWidth={1} />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 14, fill: "#1f2937", fontWeight: "900", fontFamily: "system-ui" }}
                    interval={Math.floor(chartData.length / 8)}
                    stroke="#22c55e"
                    strokeWidth={3}
                    axisLine={{ stroke: "#22c55e", strokeWidth: 3 }}
                  />
                  <YAxis
                    label={{
                      value: "Power (kW)",
                      angle: -90,
                      position: "insideLeft",
                      style: { fontSize: 16, fill: "#1f2937", fontWeight: "900", fontFamily: "system-ui" },
                    }}
                    tick={{ fontSize: 14, fill: "#1f2937", fontWeight: "900", fontFamily: "system-ui" }}
                    stroke="#22c55e"
                    strokeWidth={3}
                    axisLine={{ stroke: "#22c55e", strokeWidth: 3 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "3px solid #22c55e",
                      borderRadius: "0px",
                      fontWeight: "900",
                      fontSize: "16px",
                      fontFamily: "system-ui",
                      boxShadow: "0 8px 32px rgba(34, 197, 94, 0.3)",
                    }}
                    labelStyle={{
                      color: "#1f2937",
                      fontWeight: "900",
                      fontSize: "16px",
                      fontFamily: "system-ui",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ 
                      fontSize: "16px", 
                      paddingTop: "20px", 
                      fontWeight: "900", 
                      fontFamily: "system-ui",
                      color: "#1f2937"
                    }}
                    iconType="line"
                  />
                  <Line
                    type="monotone"
                    dataKey="production"
                    name="Production"
                    stroke="#f59e0b"
                    strokeWidth={4}
                    dot={false}
                    activeDot={{ r: 10, stroke: "#f59e0b", strokeWidth: 4, fill: "#f59e0b" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="consumption"
                    name="Consumption"
                    stroke="#ef4444"
                    strokeWidth={4}
                    dot={false}
                    activeDot={{ r: 10, stroke: "#ef4444", strokeWidth: 4, fill: "#ef4444" }}
                  />
                    <Line
                      type="monotone"
                      dataKey="shared"
                      name="🔄 Microgrid Shared"
                      stroke="#22c55e"
                      strokeWidth={5}
                      dot={{ r: 6, fill: "#22c55e", stroke: "#ffffff", strokeWidth: 3 }}
                      activeDot={{ r: 12, stroke: "#22c55e", strokeWidth: 5, fill: "#22c55e" }}
                    />
                  <Line
                    type="monotone"
                    dataKey="gridImport"
                    name="Grid Import"
                    stroke="#3b82f6"
                    strokeWidth={4}
                    dot={false}
                    strokeDasharray="10 5"
                    activeDot={{ r: 10, stroke: "#3b82f6", strokeWidth: 4, fill: "#3b82f6" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="gridExport"
                    name="Grid Export"
                    stroke="#06b6d4"
                    strokeWidth={4}
                    dot={false}
                    strokeDasharray="10 5"
                    activeDot={{ r: 10, stroke: "#06b6d4", strokeWidth: 4, fill: "#06b6d4" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[350px] flex items-center justify-center text-gray-600 dark:text-gray-300">
                <div className="text-center">
                  <Activity className="h-12 w-12 mx-auto mb-4 animate-pulse text-green-600 dark:text-green-400" />
                  <p className="text-lg font-bold">Collecting data... Chart will appear shortly</p>
                </div>
              </div>
            )}

            {/* Summary Stats */}
            {chartData.length > 0 && (
              <div className="mt-6 pt-4 border-t">
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Current Energy Status</h4>
                  <div className="grid grid-cols-5 gap-4">
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {chartData[chartData.length - 1].production}
                      </div>
                      <div className="text-xs text-muted-foreground">Production (kW)</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {chartData[chartData.length - 1].consumption}
                      </div>
                      <div className="text-xs text-muted-foreground">Consumption (kW)</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg border-2 border-green-200">
                      <div className="text-2xl font-bold text-green-600">
                        {chartData[chartData.length - 1].shared}
                      </div>
                      <div className="text-xs text-muted-foreground font-semibold">🔄 Microgrid Shared (kW)</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {chartData[chartData.length - 1].gridImport}
                      </div>
                      <div className="text-xs text-muted-foreground">Import (kW)</div>
                    </div>
                    <div className="text-center p-3 bg-cyan-50 rounded-lg">
                      <div className="text-2xl font-bold text-cyan-600">
                        {chartData[chartData.length - 1].gridExport}
                      </div>
                      <div className="text-xs text-muted-foreground">Export (kW)</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sharp Modern Live Homes Grid */}
        <Card className="bg-white dark:bg-gray-900 border-2 border-green-600 dark:border-green-400 shadow-[0_0_0_1px_rgba(34,197,94,0.1)] hover:shadow-[0_0_0_1px_rgba(34,197,94,0.2)] transition-all duration-200">
          <CardHeader>
            <CardTitle className="text-2xl font-black flex items-center gap-3 text-gray-800 dark:text-white">
              <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
              Live Home Status
            </CardTitle>
            <CardDescription className="text-base text-gray-600 dark:text-gray-300 font-medium">Real-time power flows and battery state for 15 key homes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {liveData.homes.slice(0, 15).map((home) => {
                const familyName = getFamilyName(home.id);
                const isMicrogrid = ['H001', 'H002', 'H003', 'H004', 'H005', 'H006', 'H007', 'H008', 'H009', 'H010', 'H016', 'H017', 'H018', 'H019', 'H020'].includes(home.id);
                
                return (
                  <Card key={home.id} className={`relative overflow-hidden transition-all duration-200 hover:shadow-[0_0_0_2px_rgba(34,197,94,0.3)] ${isMicrogrid ? 'border-3 border-green-600 dark:border-green-400 bg-green-50/40 dark:bg-green-900/30 shadow-[0_0_0_1px_rgba(34,197,94,0.1)]' : 'border-3 border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-800 shadow-[0_0_0_1px_rgba(107,114,128,0.1)]'}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-5">
                        <div className="font-black text-lg text-gray-800 dark:text-white tracking-tight">{familyName} Family</div>
                        {isMicrogrid && (
                          <div className="w-4 h-4 border-2 border-green-600 dark:border-green-400 bg-green-600 dark:bg-green-400"></div>
                        )}
                      </div>
                    
                      <div className="space-y-4 text-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 dark:text-gray-300 flex items-center gap-3 font-black text-base">
                            <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
                            PV:
                          </span>
                          <span className="font-mono font-black text-xl text-gray-800 dark:text-white">{home.pv} kW</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 dark:text-gray-300 flex items-center gap-3 font-black text-base">
                            <TrendingDown className="h-5 w-5 text-green-600 dark:text-green-400" />
                            Load:
                          </span>
                          <span className="font-mono font-black text-xl text-gray-800 dark:text-white">{home.load} kW</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 dark:text-gray-300 flex items-center gap-3 font-black text-base">
                            <Battery className="h-5 w-5 text-green-600 dark:text-green-400" />
                            SOC:
                          </span>
                          <span className="font-mono font-black text-xl text-gray-800 dark:text-white">{home.soc}%</span>
                        </div>
                      
                        {home.share > 0 && (
                          <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                            <span className="flex items-center gap-3 font-black text-base">
                              <div className="w-4 h-4 border-2 border-green-600 dark:border-green-400 bg-green-600 dark:bg-green-400"></div>
                              Share:
                            </span>
                            <span className="font-mono font-black text-xl">{home.share.toFixed(2)} kW</span>
                          </div>
                        )}
                        
                        {home.recv > 0 && (
                          <div className="flex justify-between items-center text-blue-600 dark:text-blue-400">
                            <span className="flex items-center gap-3 font-black text-base">
                              <div className="w-4 h-4 border-2 border-blue-600 dark:border-blue-400 bg-blue-600 dark:bg-blue-400"></div>
                              Recv:
                            </span>
                            <span className="font-mono font-black text-xl">{home.recv.toFixed(2)} kW</span>
                          </div>
                        )}
                        
                        {home.exp > 0 && (
                          <div className="flex justify-between items-center text-purple-600 dark:text-purple-400">
                            <span className="flex items-center gap-3 font-black text-base">
                              <div className="w-4 h-4 border-2 border-purple-600 dark:border-purple-400 bg-purple-600 dark:bg-purple-400"></div>
                              Export:
                            </span>
                            <span className="font-mono font-black text-xl">{home.exp.toFixed(1)} kW</span>
                          </div>
                        )}
                        
                        {home.imp > 0 && (
                          <div className="flex justify-between items-center text-red-600 dark:text-red-400">
                            <span className="flex items-center gap-3 font-black text-base">
                              <div className="w-4 h-4 border-2 border-red-600 dark:border-red-400 bg-red-600 dark:bg-red-400"></div>
                              Import:
                            </span>
                            <span className="font-mono font-black text-xl">{home.imp.toFixed(2)} kW</span>
                          </div>
                        )}
                    </div>

                      {/* Sharp Modern Credits and Savings Information */}
                      {isMicrogrid && (
                        <div className="mt-5 space-y-4 text-lg border-t-3 border-green-600 dark:border-green-400 pt-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 dark:text-gray-300 flex items-center gap-3 font-black text-base">
                              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                              Credits:
                            </span>
                            <span className="font-mono font-black text-xl text-green-600 dark:text-green-400">
                              {home.credits_balance_kwh?.toFixed(1) || '0.0'} kWh
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 dark:text-gray-300 flex items-center gap-3 font-black text-base">
                              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                              $ Saved:
                            </span>
                            <span className="font-mono font-black text-xl text-green-600 dark:text-green-400">
                              ${home.savings_usd?.toFixed(2) || '0.00'}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Sharp Modern Battery Status Block */}
                      <div className="mt-5 p-4 bg-gray-100 dark:bg-gray-700 border-3 border-gray-400 dark:border-gray-500 shadow-[0_0_0_1px_rgba(107,114,128,0.1)]">
                        <div className="flex justify-between items-center">
                          <span className="text-base font-black text-gray-700 dark:text-gray-300">Battery Status:</span>
                          <div className={`px-4 py-2 text-base font-black border-2 ${
                            home.soc > 60 ? 'bg-green-600 dark:bg-green-400 text-white dark:text-black border-green-600 dark:border-green-400' : 
                            home.soc > 30 ? 'bg-yellow-600 dark:bg-yellow-400 text-white dark:text-black border-yellow-600 dark:border-yellow-400' : 'bg-red-600 dark:bg-red-400 text-white dark:text-black border-red-600 dark:border-red-400'
                          }`}>
                            {home.soc > 60 ? 'High' : home.soc > 30 ? 'Medium' : 'Low'}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Unserved Load Warning */}
        {liveData.community.unserved > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Grid Outage Active:</strong> {liveData.community.unserved.toFixed(2)} kW of load is unserved
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}

