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
      <Card className="bg-white dark:bg-gray-900 border-3 border-green-600 dark:border-green-400 shadow-[0_0_0_2px_rgba(34,197,94,0.2)] hover:shadow-[0_0_0_3px_rgba(34,197,94,0.3)] transition-all duration-200">
        <CardHeader>
          <CardTitle className="text-3xl font-black text-gray-800 dark:text-white tracking-tight">Complete Energy Flow Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-lg font-black text-gray-600 dark:text-gray-300">Loading chart data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-900 border-3 border-green-600 dark:border-green-400 shadow-[0_0_0_2px_rgba(34,197,94,0.2)] hover:shadow-[0_0_0_3px_rgba(34,197,94,0.3)] transition-all duration-200">
      <CardHeader>
        <CardTitle className="text-3xl font-black text-gray-800 dark:text-white tracking-tight">Complete Energy Flow Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="#22c55e" opacity={0.3} strokeWidth={1} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 14, fill: "#1f2937", fontWeight: "900", fontFamily: "system-ui" }}
              interval={Math.floor(data.length / 8)}
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
      </CardContent>
    </Card>
  );
}
