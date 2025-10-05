import { Card } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { UserTodayPoint } from '@/hooks/useUserData';

interface UsagePatternChartProps {
  todayData: UserTodayPoint[];
}

export function UsagePatternChart({ todayData }: UsagePatternChartProps) {
  const data = todayData.map((point) => ({
    time: new Date(point.ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    solar: Math.round(point.pv_w / 1000),
    consumption: Math.round(point.load_w / 1000),
    toGrid: Math.round(point.sent_to_grid_w / 1000),
  }));

  return (
    <Card className="p-6 bg-gradient-card">
      <h2 className="text-xl font-bold mb-4">Usage Pattern (Today)</h2>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="solarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--surplus))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--surplus))" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="consumptionGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--consumption))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--consumption))" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="toGridGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--grid-export))" stopOpacity={0.35}/>
              <stop offset="95%" stopColor="hsl(var(--grid-export))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="time" 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
            label={{ value: 'kWh', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="solar" 
            stroke="hsl(var(--surplus))" 
            strokeWidth={2}
            fill="url(#solarGradient)"
            name="Solar Production"
          />
          <Area 
            type="monotone" 
            dataKey="consumption" 
            stroke="hsl(var(--consumption))" 
            strokeWidth={2}
            fill="url(#consumptionGradient)"
            name="Consumption"
          />
          <Area 
            type="monotone" 
            dataKey="toGrid" 
            stroke="hsl(var(--grid-export))" 
            strokeWidth={2}
            fill="url(#toGridGradient)"
            name="Sent to Grid"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
