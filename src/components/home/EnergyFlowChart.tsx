import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ChartPoint {
  time: string;
  timestamp: number;
  production: number;
  consumption: number;
  shared: number;
  gridImport: number;
  gridExport: number;
}

interface EnergyFlowChartProps {
  data: ChartPoint[];
  maxDataPoints: number;
}

export function EnergyFlowChart({ data, maxDataPoints }: EnergyFlowChartProps) {
  if (data.length === 0) {
    return (
      <Card className="rounded-2xl border bg-[var(--surface)] shadow-sm">
        <CardHeader>
          <CardTitle className="text-[var(--ink)]">Complete Energy Flow Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-[var(--muted)]">Loading chart data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border bg-[var(--surface)] shadow-sm">
      <CardHeader>
        <CardTitle className="text-[var(--ink)]">Complete Energy Flow Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              interval={Math.floor(data.length / 8)}
              stroke="hsl(var(--border))"
            />
            <YAxis
              label={{
                value: "Power (kW)",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 12, fill: "hsl(var(--muted-foreground))" },
              }}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              stroke="hsl(var(--border))"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
              iconType="line"
            />
            <Line
              type="monotone"
              dataKey="production"
              name="Production"
              stroke="hsl(45 93% 58%)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="consumption"
              name="Consumption"
              stroke="hsl(0 66% 54%)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="shared"
              name="🔄 Microgrid Shared"
              stroke="hsl(158 74% 40%)"
              strokeWidth={4}
              dot={{ r: 4, fill: "hsl(158 74% 40%)" }}
              activeDot={{ r: 8, stroke: "hsl(158 74% 40%)", strokeWidth: 3 }}
            />
            <Line
              type="monotone"
              dataKey="gridImport"
              name="Grid Import"
              stroke="hsl(218 100% 62%)"
              strokeWidth={2}
              dot={false}
              strokeDasharray="5 5"
            />
            <Line
              type="monotone"
              dataKey="gridExport"
              name="Grid Export"
              stroke="hsl(187 100% 39%)"
              strokeWidth={2}
              dot={false}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
