/**
 * User Live Dashboard - Real-time home energy monitoring
 */

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UserHeader } from "@/components/user/UserHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Activity, Home, Sun, Battery, Zap, ArrowUpCircle, ArrowDownCircle, Power, AlertTriangle, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

// Import Tesla-style components
import { HeroHouse3DPro } from "@/components/home/HeroHouse3DPro";
import { MetricTile } from "@/components/home/MetricTile";
import { FlowStatCard } from "@/components/home/FlowStatCard";
import { EnergyFlowChart } from "@/components/home/EnergyFlowChart";

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
  // Credits and economics tracking
  credits_balance_kwh?: number;
  earned_today_kwh?: number;
  used_today_kwh?: number;
  local_value_usd?: number;
  local_cost_usd?: number;
  baseline_cost_usd?: number;
  microgrid_cost_usd?: number;
  savings_usd?: number;
}

interface ChartPoint {
  time: string;
  timestamp: number;
  production: number;
  consumption: number;
  shared: number;
  gridImport: number;
  gridExport: number;
}

// Family name mapping for user display
const familyNames: Record<string, string> = {
  "H001": "Johnson Family",
  "H002": "Smith Family", 
  "H003": "Williams Family",
  "H004": "Brown Family",
  "H005": "Davis Family",
  "H006": "Miller Family",
  "H007": "Wilson Family",
  "H008": "Moore Family",
  "H009": "Taylor Family",
  "H010": "Anderson Family",
  "H011": "Thomas Family",
  "H012": "Jackson Family",
  "H013": "White Family",
  "H014": "Harris Family",
  "H015": "Martin Family",
  "H016": "Thompson Family",
  "H017": "Garcia Family",
  "H018": "Martinez Family",
  "H019": "Robinson Family",
  "H020": "Clark Family",
  "H021": "Rodriguez Family",
  "H022": "Lewis Family",
  "H023": "Lee Family",
  "H024": "Walker Family",
  "H025": "Hall Family"
};

export default function UserAppLive() {
  const { homeId: authHomeId } = useAuth();
  const homeId = authHomeId || "H001"; // Default to H001 if not set
  const familyName = familyNames[homeId] || `Home ${homeId}`;
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liveHome, setLiveHome] = useState<SSEHome | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [simulationTime, setSimulationTime] = useState(new Date());
  const maxDataPoints = 96; // 24 hours of 15-minute intervals (15 min = 1 second)

  // Generate realistic energy patterns based on time of day
  const generateRealisticData = (timestamp: Date): SSEHome => {
    const hour = timestamp.getHours();
    const minute = timestamp.getMinutes();
    const minuteOfDay = hour * 60 + minute;
    
    // More realistic solar generation curve (peaks at noon, smooth transitions)
    let solarKw = 0;
    if (hour >= 6 && hour <= 18) {
      // Smooth solar curve from 6 AM to 6 PM
      const progress = (hour - 6) / 12; // 0 to 1
      const solarMultiplier = Math.sin(progress * Math.PI); // Smooth bell curve
      solarKw = Math.max(0, solarMultiplier * 6); // Peak at 6 kW
    }
    
    // More realistic load profile with smooth transitions
    let loadKw = 0.8; // Base load
    if (hour >= 6 && hour <= 9) {
      // Morning peak (7-9 AM)
      loadKw = 1.2 + (hour - 6) * 0.1;
    } else if (hour >= 17 && hour <= 22) {
      // Evening peak (5-10 PM)
      loadKw = 1.5 + (hour - 17) * 0.2;
    } else if (hour >= 22 || hour <= 6) {
      // Night (10 PM - 6 AM)
      loadKw = 0.6;
    }
    
    // Battery SOC management with 6kWh capacity
    const batteryCapacityKwh = 6; // 6kWh battery capacity
    let currentSoc = 12; // Start at 12%
    
    // Morning battery charging (6-10 AM) - increase SOC significantly
    if (hour >= 6 && hour <= 10) {
      // Morning charging period - solar starts producing
      const morningProgress = (hour - 6) / 4; // 0 to 1 from 6-10 AM
      const morningCharge = 12 + (morningProgress * 40); // Charge from 12% to 52% by 10 AM
      currentSoc = Math.min(95, morningCharge);
    } else if (solarKw > loadKw) {
      // Charging: solar exceeds load (rest of day)
      const excessPower = solarKw - loadKw;
      const chargeRate = (excessPower / batteryCapacityKwh) * 100; // Convert kW to % per 15min
      currentSoc = Math.min(95, currentSoc + chargeRate * 0.25); // 15min = 0.25 hours
    } else if (solarKw < loadKw) {
      // Discharging: load exceeds solar
      const deficitPower = loadKw - solarKw;
      const dischargeRate = (deficitPower / batteryCapacityKwh) * 100; // Convert kW to % per 15min
      currentSoc = Math.max(5, currentSoc - dischargeRate * 0.25); // 15min = 0.25 hours
    }
    
    // Evening battery usage (6-9 PM) - use stored energy
    if (hour >= 18 && hour <= 21 && currentSoc > 20) {
      // Use battery in evening when SOC is high
      const eveningDischarge = Math.min(loadKw * 0.4, 1.5); // Use up to 40% of load from battery
      const dischargeRate = (eveningDischarge / batteryCapacityKwh) * 100;
      currentSoc = Math.max(5, currentSoc - dischargeRate * 0.25);
    }
    
    // Energy balance and grid interaction
    let energyBalance = solarKw - loadKw;
    let gridImport = 0;
    let gridExport = 0;
    let sharing = 0;
    let receiving = 0;
    
    // Account for battery usage in energy balance
    let batteryContribution = 0;
    
    // Morning battery usage (6-9 AM when no solar)
    if (hour >= 6 && hour <= 9 && solarKw < 0.5) {
      // Use battery in morning when no solar
      batteryContribution = Math.min(loadKw * 0.3, 1.0); // Use up to 30% of load from battery
      energyBalance = solarKw - (loadKw - batteryContribution); // Reduce load by battery contribution
    }
    
    // Evening battery usage (6-9 PM when SOC is high)
    if (hour >= 18 && hour <= 21 && currentSoc > 20) {
      // Use battery in evening when SOC is high
      batteryContribution = Math.min(loadKw * 0.4, 1.5); // Use up to 40% of load from battery
      energyBalance = solarKw - (loadKw - batteryContribution); // Reduce load by battery contribution
    }
    
    if (energyBalance > 0) {
      // Excess solar - share with community first, then export to grid
      const excessEnergy = energyBalance;
      sharing = Math.min(excessEnergy * 0.6, 2.0); // Share 60% with community, max 2 kW
      gridExport = Math.max(0, excessEnergy - sharing);
    } else if (energyBalance < 0) {
      // Energy deficit - try community first, then grid
      const deficit = Math.abs(energyBalance);
      receiving = Math.min(deficit * 0.4, 1.5); // Get 40% from community, max 1.5 kW
      gridImport = Math.max(0, deficit - receiving);
    }
    
    // Calculate credits and economics for fallback simulation
    const fairRate = 0.18; // $0.18/kWh for microgrid transactions
    const retailImport = 0.30; // $0.30/kWh for grid import
    const exportRate = 0.07; // $0.07/kWh for grid export
    
    // Simulate some microgrid activity for demonstration
    const creditsEarned = sharing * 0.1; // Small amount of credits earned
    const creditsUsed = receiving * 0.1; // Small amount of credits used
    const creditsBalance = creditsEarned - creditsUsed;
    
    const localValue = sharing * fairRate;
    const localCost = receiving * fairRate;
    
    const baselineCost = (gridImport * retailImport) - (gridExport * exportRate);
    const microgridCost = localCost + (gridImport * retailImport) - (gridExport * exportRate);
    const savings = baselineCost - microgridCost;
    
    return {
      id: homeId,
      pv: Math.round(solarKw * 100) / 100,
      load: Math.round(loadKw * 100) / 100,
      soc: Math.round(currentSoc),
      share: Math.round(sharing * 100) / 100,
      recv: Math.round(receiving * 100) / 100,
      imp: Math.round(gridImport * 100) / 100,
      exp: Math.round(gridExport * 100) / 100,
      creditsDelta: Math.round((sharing - receiving) * 100) / 100,
      // Credits and economics tracking
      credits_balance_kwh: Math.round(creditsBalance * 100) / 100,
      earned_today_kwh: Math.round(creditsEarned * 100) / 100,
      used_today_kwh: Math.round(creditsUsed * 100) / 100,
      local_value_usd: Math.round(localValue * 100) / 100,
      local_cost_usd: Math.round(localCost * 100) / 100,
      baseline_cost_usd: Math.round(baselineCost * 100) / 100,
      microgrid_cost_usd: Math.round(microgridCost * 100) / 100,
      savings_usd: Math.round(savings * 100) / 100,
    };
  };

  useEffect(() => {
    // Try to connect to real simulator first
    const baseUrl = import.meta.env.VITE_SIM_API_URL as string;
    const es = new EventSource(`${baseUrl}/stream`);

    es.onopen = () => {
      setConnected(true);
      setError(null);
    };

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Find this user's home
        const myHome = data.homes.find((h: SSEHome) => h.id === homeId);
        
        if (myHome) {
          // Create enhanced home data with credits and economics
          const enhancedHome = {
            ...myHome,
            // Ensure all credits and economics fields are included
            credits_balance_kwh: myHome.credits_balance_kwh || 0,
            earned_today_kwh: myHome.earned_today_kwh || 0,
            used_today_kwh: myHome.used_today_kwh || 0,
            local_value_usd: myHome.local_value_usd || 0,
            local_cost_usd: myHome.local_cost_usd || 0,
            baseline_cost_usd: myHome.baseline_cost_usd || 0,
            microgrid_cost_usd: myHome.microgrid_cost_usd || 0,
            savings_usd: myHome.savings_usd || 0,
          };
          
          setLiveHome(enhancedHome);
          
          // Add to chart
          const time = new Date(data.ts);
          const newPoint: ChartPoint = {
            time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            timestamp: time.getTime(),
            production: myHome.pv,
            consumption: myHome.load,
            shared: myHome.share,
            gridImport: myHome.imp,
            gridExport: myHome.exp,
          };
          
          setChartData(prev => {
            const updated = [...prev, newPoint];
            return updated.slice(-maxDataPoints);
          });
        }
      } catch (err) {
        console.error("Failed to parse SSE data:", err);
      }
    };

    es.onerror = () => {
      setConnected(false);
      // Fall back to realistic simulation if simulator is not available
      console.log("Simulator not available, using realistic simulation");
      
      // Generate initial realistic data
      const initialData = generateRealisticData(simulationTime);
      setLiveHome(initialData);
      
      // Start realistic simulation timer (15 min = 2 seconds)
      const simulationInterval = setInterval(() => {
        // Advance simulation time by 15 minutes
        setSimulationTime(prev => {
          const newTime = new Date(prev.getTime() + 15 * 60 * 1000); // Add 15 minutes
          const realisticData = generateRealisticData(newTime);
          setLiveHome(realisticData);
          
          // Add to chart
          const newPoint: ChartPoint = {
            time: newTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            timestamp: newTime.getTime(),
            production: realisticData.pv,
            consumption: realisticData.load,
            shared: realisticData.share,
            gridImport: realisticData.imp,
            gridExport: realisticData.exp,
          };
          
          setChartData(prev => {
            const updated = [...prev, newPoint];
            return updated.slice(-maxDataPoints);
          });
          
          return newTime;
        });
      }, 2000); // Update every 2 seconds (represents 15 minutes) - slightly faster
      
      return () => {
        clearInterval(simulationInterval);
        es.close();
      };
    };

    return () => es.close();
  }, [homeId]);

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <UserHeader homeId={homeId || "H001"} />
        <div className="max-w-6xl mx-auto p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Connection Error</h1>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!liveHome) {
    return (
      <div className="min-h-screen bg-background">
        <UserHeader homeId={homeId || "H001"} />
        <div className="max-w-6xl mx-auto p-6">
          <div className="text-center">
            <Activity className="h-12 w-12 animate-pulse mx-auto text-primary mb-4" />
            <h1 className="text-2xl font-bold mb-2">Connecting to {familyName}...</h1>
            <p className="text-muted-foreground">Loading live energy data</p>
          </div>
        </div>
      </div>
    );
  }

  const handleGoOffGrid = async () => {
    try {
      const baseUrl = import.meta.env.VITE_SIM_API_URL as string;
      await fetch(`${baseUrl}/sim/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'OUTAGE' })
      });
    } catch (err) {
      console.error('Failed to trigger outage:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900 dark:to-emerald-900">
      <UserHeader homeId={homeId || "H001"} />

      <div className="max-w-6xl mx-auto p-8 space-y-8">
        {/* Sharp Modern Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black flex items-center gap-3 text-gray-800 dark:text-white tracking-tight">
              <Home className="h-10 w-10 text-green-600 dark:text-green-400" />
              {familyName}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-2 font-medium">
              Live energy monitoring • Updated every 2s (15-min intervals)
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge 
              variant={connected ? "default" : "secondary"} 
              className="text-sm font-black bg-green-600 dark:bg-green-400 text-white dark:text-black border-2 border-green-600 dark:border-green-400"
            >
              {connected ? "🟢 LIVE" : "⚫ Offline"}
            </Badge>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleGoOffGrid}
              className="h-10 px-6 font-black border-2 border-green-600 dark:border-green-400 text-green-600 dark:text-green-400 hover:bg-green-600 dark:hover:bg-green-400 hover:text-white dark:hover:text-black transition-all duration-200"
            >
              <Power className="h-4 w-4 mr-2" />
              Go Off-Grid
            </Button>
          </div>
        </div>

        {/* Production-Grade Tesla-Style Hero */}
        <HeroHouse3DPro
          pvKw={liveHome.pv}
          loadKw={liveHome.load}
          socPct={liveHome.soc}
          reservePct={40} // Configurable backup reserve
          impKw={liveHome.imp}
          expKw={liveHome.exp}
          shareKw={liveHome.share}
          recvKw={liveHome.recv}
          updatedAt={new Date()}
        />

        {/* Sharp Modern Primary Metrics - Small Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white dark:bg-gray-900 border-3 border-yellow-500 dark:border-yellow-400 shadow-[0_0_0_2px_rgba(234,179,8,0.2)] hover:shadow-[0_0_0_3px_rgba(234,179,8,0.3)] transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-5 h-5 bg-yellow-500 dark:bg-yellow-400"></div>
                <div className="text-lg font-black text-gray-800 dark:text-white">SOLAR</div>
              </div>
              <div className="text-4xl font-black text-yellow-600 dark:text-yellow-400 mb-2">
                {liveHome.pv.toFixed(1)} kW
              </div>
              <div className="text-base font-medium text-gray-700 dark:text-gray-300">Current generation</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-900 border-3 border-gray-500 dark:border-gray-400 shadow-[0_0_0_2px_rgba(107,114,128,0.2)] hover:shadow-[0_0_0_3px_rgba(107,114,128,0.3)] transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-5 h-5 bg-gray-500 dark:bg-gray-400"></div>
                <div className="text-lg font-black text-gray-800 dark:text-white">HOME</div>
              </div>
              <div className="text-4xl font-black text-gray-800 dark:text-white mb-2">
                {liveHome.load.toFixed(1)} kW
              </div>
              <div className="text-base font-medium text-gray-700 dark:text-gray-300">Current usage</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-900 border-3 border-purple-500 dark:border-purple-400 shadow-[0_0_0_2px_rgba(168,85,247,0.2)] hover:shadow-[0_0_0_3px_rgba(168,85,247,0.3)] transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-5 h-5 bg-purple-500 dark:bg-purple-400"></div>
                <div className="text-lg font-black text-gray-800 dark:text-white">BATTERY</div>
              </div>
              <div className="text-4xl font-black text-purple-600 dark:text-purple-400 mb-2">
                {liveHome.soc.toFixed(0)}%
              </div>
              <div className="text-base font-medium text-gray-700 dark:text-gray-300">
                {(liveHome.soc * 0.06).toFixed(1)}kWh / 6kWh
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sharp Modern Credits and Economics - House Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white dark:bg-gray-900 border-3 border-green-600 dark:border-green-400 shadow-[0_0_0_2px_rgba(34,197,94,0.2)] hover:shadow-[0_0_0_3px_rgba(34,197,94,0.3)] transition-all duration-200">
            <CardHeader className="pb-5">
              <CardTitle className="text-xl font-black flex items-center gap-4 text-gray-800 dark:text-white">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                Credits Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-black text-gray-700 dark:text-gray-300">Earned:</span>
                  <span className="font-mono font-black text-xl text-green-600 dark:text-green-400">
                    {liveHome.earned_today_kwh?.toFixed(1) || '0.0'} kWh
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-black text-gray-700 dark:text-gray-300">Used:</span>
                  <span className="font-mono font-black text-xl text-blue-600 dark:text-blue-400">
                    {liveHome.used_today_kwh?.toFixed(1) || '0.0'} kWh
                  </span>
                </div>
                <div className="flex justify-between items-center border-t-3 border-green-600 dark:border-green-400 pt-4">
                  <span className="text-lg font-black text-gray-800 dark:text-white">Net MTD:</span>
                  <span className="font-mono font-black text-xl text-gray-800 dark:text-white">
                    {liveHome.credits_balance_kwh?.toFixed(1) || '0.0'} kWh
                  </span>
                </div>
                <div className="text-base text-gray-600 dark:text-gray-400 mt-4 font-black">
                  Value: ${liveHome.local_value_usd?.toFixed(2) || '0.00'} earned, ${liveHome.local_cost_usd?.toFixed(2) || '0.00'} spent
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900 border-3 border-green-600 dark:border-green-400 shadow-[0_0_0_2px_rgba(34,197,94,0.2)] hover:shadow-[0_0_0_3px_rgba(34,197,94,0.3)] transition-all duration-200">
            <CardHeader className="pb-5">
              <CardTitle className="text-xl font-black flex items-center gap-4 text-gray-800 dark:text-white">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                Cost Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-black text-gray-700 dark:text-gray-300">Baseline Cost:</span>
                  <span className="font-mono font-black text-xl text-red-600 dark:text-red-400">
                    ${liveHome.baseline_cost_usd?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-black text-gray-700 dark:text-gray-300">Microgrid Cost:</span>
                  <span className="font-mono font-black text-xl text-blue-600 dark:text-blue-400">
                    ${liveHome.microgrid_cost_usd?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t-3 border-green-600 dark:border-green-400 pt-4">
                  <span className="text-lg font-black text-gray-800 dark:text-white">Savings:</span>
                  <span className="font-mono font-black text-xl text-green-600 dark:text-green-400">
                    ${liveHome.savings_usd?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="text-base text-gray-600 dark:text-gray-400 mt-4 font-black">
                  Fair rate: $0.18/kWh for microgrid transactions
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sharp Modern Community Sharing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FlowStatCard
            title="Sharing with Community"
            kw={liveHome.share}
            tone="green"
            description="Helping neighbors"
            icon={<ArrowUpCircle className="h-5 w-5" />}
          />
          <FlowStatCard
            title="Receiving from Community"
            kw={liveHome.recv}
            tone="blue"
            description="Getting help from neighbors"
            icon={<ArrowDownCircle className="h-5 w-5" />}
          />
        </div>

        {/* Sharp Modern Grid Interaction */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white dark:bg-gray-900 border-3 border-orange-500 dark:border-orange-400 shadow-[0_0_0_2px_rgba(249,115,22,0.2)] hover:shadow-[0_0_0_3px_rgba(249,115,22,0.3)] transition-all duration-200">
            <CardContent className="p-6">
              <div className="text-center p-6 bg-orange-50 dark:bg-orange-950/20 border-2 border-orange-200 dark:border-orange-800">
                <div className="text-4xl font-black text-orange-600 dark:text-orange-400 mb-3">
                  {liveHome.imp.toFixed(1)} kW
                </div>
                <div className="text-lg font-black text-gray-700 dark:text-gray-300">Grid Import</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-900 border-3 border-cyan-500 dark:border-cyan-400 shadow-[0_0_0_2px_rgba(6,182,212,0.2)] hover:shadow-[0_0_0_3px_rgba(6,182,212,0.3)] transition-all duration-200">
            <CardContent className="p-6">
              <div className="text-center p-6 bg-cyan-50 dark:bg-cyan-950/20 border-2 border-cyan-200 dark:border-cyan-800">
                <div className="text-4xl font-black text-cyan-600 dark:text-cyan-400 mb-3">
                  {liveHome.exp.toFixed(1)} kW
                </div>
                <div className="text-lg font-black text-gray-700 dark:text-gray-300">Grid Export</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tesla-style Energy Flow Chart */}
        <EnergyFlowChart data={chartData} maxDataPoints={maxDataPoints} />

      </div>
    </div>
  );
}