import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp } from 'lucide-react';
import type { UserForecast } from '@/data/MockDataProvider';
import { formatCredits } from '@/lib/formatters';

interface MonthlyForecastProps {
  forecast: UserForecast;
}

export function MonthlyForecast({ forecast }: MonthlyForecastProps) {
  const data = forecast.days.map((day, idx) => ({
    day,
    solar: Math.round(forecast.solar_kwh[idx]),
    consumption: Math.round(forecast.consumption_kwh[idx]),
  }));

  return (
    <Card className="p-6 bg-gradient-card">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">7-Day Forecast</h2>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="day" 
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
            dataKey="solar" 
            stroke="hsl(var(--surplus))" 
            strokeWidth={2}
            name="Solar"
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="consumption" 
            stroke="hsl(var(--consumption))" 
            strokeWidth={2}
            name="Consumption"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Month-end projection</span>
          </div>
          <span className={`text-xl font-bold tabular-nums ${forecast.credits_month_end_projection_kwh >= 0 ? 'text-surplus' : 'text-consumption'}`}>
            {formatCredits(forecast.credits_month_end_projection_kwh)} kWh
          </span>
        </div>
      </div>
    </Card>
  );
}
