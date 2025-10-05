import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { AdminTrends } from '@/data/MockDataProvider';

interface PmgGridTrendProps {
  trends: AdminTrends;
}

export function PmgGridTrend({ trends }: PmgGridTrendProps) {
  const data = trends.times.map((time, idx) => ({
    time,
    production: Math.round(trends.production_kwh[idx]),
    microgrid: Math.round(trends.microgrid_used_kwh[idx]),
    grid: Math.round(trends.grid_kwh[idx]),
  }));

  return (
    <Card className="p-6 bg-gradient-card">
      <h2 className="text-xl font-bold mb-4">Energy Flow Trend (Today)</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
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
          <Line 
            type="monotone" 
            dataKey="production" 
            stroke="hsl(var(--surplus))" 
            strokeWidth={2}
            name="Production"
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="microgrid" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            name="Microgrid Used"
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="grid" 
            stroke="hsl(var(--consumption))" 
            strokeWidth={2}
            name="Grid (+ import, - export)"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
