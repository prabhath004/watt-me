/**
 * Community Trend Chart - Hourly trends of production, microgrid, grid import
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";
import type { HourlyTrend } from "@/types/community";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LineChart as LineChartIcon, BarChart3 } from "lucide-react";

interface CommunityTrendChartProps {
  trends: HourlyTrend[];
}

export function CommunityTrendChart({ trends }: CommunityTrendChartProps) {
  const [chartType, setChartType] = useState<"line" | "area">("line");

  // Format data for chart
  const chartData = trends.map((trend, index) => ({
    hour: trend.timestamp_hour.split(" ")[1] || trend.timestamp_hour, // Just show time
    date: trend.timestamp_hour.split(" ")[0], // Date for tooltip
    fullTime: trend.timestamp_hour,
    index: index,
    Production: Number(trend.production_kwh.toFixed(2)),
    Microgrid: Number(trend.microgrid_used_kwh.toFixed(2)),
    "Grid Import": Number(trend.grid_import_kwh.toFixed(2)),
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm mb-2">{data.fullTime}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="font-medium">{entry.name}:</span>
              <span className="font-mono">{entry.value.toFixed(2)} kWh</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Community Energy Trends</CardTitle>
            <CardDescription>
              Hourly production, local sharing, and grid import over {(trends.length / 24).toFixed(1)} days
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={chartType === "line" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType("line")}
            >
              <LineChartIcon className="h-4 w-4 mr-1" />
              Line
            </Button>
            <Button
              variant={chartType === "area" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType("area")}
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              Area
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          {chartType === "line" ? (
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                interval={Math.floor(chartData.length / 12)}
                stroke="hsl(var(--border))"
              />
              <YAxis
                label={{
                  value: "Energy (kWh)",
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: 12, fill: "hsl(var(--muted-foreground))" },
                }}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                stroke="hsl(var(--border))"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                iconType="line"
              />
              <Line
                type="monotone"
                dataKey="Production"
                stroke="hsl(45 93% 58%)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="Microgrid"
                stroke="hsl(158 74% 40%)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="Grid Import"
                stroke="hsl(218 100% 62%)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          ) : (
            <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorProduction" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(45 93% 58%)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(45 93% 58%)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorMicrogrid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(158 74% 40%)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(158 74% 40%)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorGrid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(218 100% 62%)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(218 100% 62%)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                interval={Math.floor(chartData.length / 12)}
                stroke="hsl(var(--border))"
              />
              <YAxis
                label={{
                  value: "Energy (kWh)",
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: 12, fill: "hsl(var(--muted-foreground))" },
                }}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                stroke="hsl(var(--border))"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                iconType="rect"
              />
              <Area
                type="monotone"
                dataKey="Production"
                stroke="hsl(45 93% 58%)"
                fillOpacity={1}
                fill="url(#colorProduction)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="Microgrid"
                stroke="hsl(158 74% 40%)"
                fillOpacity={1}
                fill="url(#colorMicrogrid)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="Grid Import"
                stroke="hsl(218 100% 62%)"
                fillOpacity={1}
                fill="url(#colorGrid)"
                strokeWidth={2}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>

        {/* Summary stats below chart */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: "hsl(45 93% 58%)" }}>
              {chartData.reduce((sum, d) => sum + d.Production, 0).toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">Total Production (kWh)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: "hsl(158 74% 40%)" }}>
              {chartData.reduce((sum, d) => sum + d.Microgrid, 0).toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">Microgrid Shared (kWh)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: "hsl(218 100% 62%)" }}>
              {chartData.reduce((sum, d) => sum + d["Grid Import"], 0).toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">Grid Import (kWh)</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

