import React from 'react';
import { useParams } from 'react-router-dom';
import { UserHeader } from '@/components/user/UserHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Home, 
  Sun, 
  Battery, 
  Zap, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Activity,
  AlertTriangle,
  Power
} from 'lucide-react';

import { HeroHouse3D } from '@/components/home/HeroHouse3D';
import { MetricTile } from '@/components/home/MetricTile';
import { FlowStatCard } from '@/components/home/FlowStatCard';
import { EnergyFlowChart } from '@/components/home/EnergyFlowChart';
import { useLiveHome } from '@/components/home/useLiveHome';

export default function HomeDetails() {
  const { id } = useParams<{ id: string }>();
  const homeId = id || 'H001';
  
  const { home, grid, community, history, lastUpdate, connected, error } = useLiveHome(homeId);

  // Handle connection errors
  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg)]">
        <UserHeader homeId={homeId} />
        <div className="max-w-6xl mx-auto p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[var(--bad)] mb-4">Connection Error</h1>
            <p className="text-[var(--muted)]">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (!home) {
    return (
      <div className="min-h-screen bg-[var(--bg)]">
        <UserHeader homeId={homeId} />
        <div className="max-w-6xl mx-auto p-6">
          <div className="text-center">
            <Activity className="h-12 w-12 animate-pulse mx-auto text-[var(--accent)] mb-4" />
            <h1 className="text-2xl font-bold mb-2">Connecting to Home {homeId}...</h1>
            <p className="text-[var(--muted)]">Loading live energy data</p>
          </div>
        </div>
      </div>
    );
  }

  const handleGoOffGrid = async () => {
    try {
      await fetch('http://localhost:3001/sim/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'OUTAGE' })
      });
    } catch (err) {
      console.error('Failed to trigger outage:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <UserHeader homeId={homeId} />

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2 text-[var(--ink)]">
              <Home className="h-8 w-8 text-[var(--accent)]" />
              Home {homeId}
            </h1>
            <p className="text-[var(--muted)] mt-1">
              Live energy monitoring • Updated every 0.5s
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge 
              variant={connected ? "default" : "secondary"} 
              className="text-sm bg-green-100 text-green-700 border-green-200"
            >
              {connected ? "🟢 LIVE" : "⚫ Offline"}
            </Badge>
            {lastUpdate && (
              <span className="text-sm text-[var(--muted)]">
                Last update: {lastUpdate}
              </span>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleGoOffGrid}
              className="border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white"
            >
              <Power className="h-4 w-4 mr-2" />
              Go Off-Grid
            </Button>
          </div>
        </div>

        {/* Hero 3D House */}
        <HeroHouse3D
          pvKw={home.pv}
          loadKw={home.load}
          socPct={home.soc}
          gridImpKw={home.imp}
          gridExpKw={home.exp}
          shareKw={home.share}
          recvKw={home.recv}
        />

        {/* Primary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricTile
            title="Solar Production"
            value={`${home.pv.toFixed(1)} kW`}
            caption="Current generation"
            icon={<Sun className="h-4 w-4" />}
            tone="info"
          />
          <MetricTile
            title="Consumption"
            value={`${home.load.toFixed(1)} kW`}
            caption="Current usage"
            icon={<Zap className="h-4 w-4" />}
            tone="neutral"
          />
          <MetricTile
            title="Battery SOC"
            value={`${home.soc.toFixed(0)}%`}
            caption="State of charge"
            icon={<Battery className="h-4 w-4" />}
            tone={home.soc < 20 ? 'bad' : home.soc < 60 ? 'neutral' : 'good'}
          />
        </div>

        {/* Community Sharing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FlowStatCard
            title="Sharing with Community"
            kw={home.share}
            tone="green"
            description="Helping neighbors"
            icon={<ArrowUpCircle className="h-5 w-5" />}
          />
          <FlowStatCard
            title="Receiving from Community"
            kw={home.recv}
            tone="blue"
            description="Getting help from neighbors"
            icon={<ArrowDownCircle className="h-5 w-5" />}
          />
        </div>

        {/* Grid Interaction */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="rounded-2xl border bg-[var(--surface)] shadow-sm">
            <CardContent className="p-6">
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-xl">
                <div className="text-2xl font-bold text-[var(--warn)]">
                  {home.imp.toFixed(1)} kW
                </div>
                <div className="text-sm text-[var(--muted)]">Grid Import</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="rounded-2xl border bg-[var(--surface)] shadow-sm">
            <CardContent className="p-6">
              <div className="text-center p-4 bg-cyan-50 dark:bg-cyan-950/20 rounded-xl">
                <div className="text-2xl font-bold text-cyan-600">
                  {home.exp.toFixed(1)} kW
                </div>
                <div className="text-sm text-[var(--muted)]">Grid Export</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Energy Flow Chart */}
        <EnergyFlowChart data={history} maxDataPoints={60} />

        {/* Unserved Load Alert */}
        {community.unserved > 0 && (
          <Alert className="border-[var(--bad)] bg-red-50 dark:bg-red-950/20">
            <AlertTriangle className="h-4 w-4 text-[var(--bad)]" />
            <AlertDescription className="text-[var(--bad)]">
              <strong>Unserved Load Detected:</strong> {community.unserved.toFixed(2)} kW of demand 
              cannot be met by current generation and storage capacity.
            </AlertDescription>
          </Alert>
        )}

        {/* Success Message */}
        <Card className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-white text-sm font-bold">✓</span>
              </div>
              <div>
                <h3 className="font-semibold text-green-700 dark:text-green-400">
                  Your Home Dashboard is Working!
                </h3>
                <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                  Your personal energy dashboard is successfully receiving live data from the simulator backend.
                  All energy flows are updating in real-time with the complete chart visualization!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
