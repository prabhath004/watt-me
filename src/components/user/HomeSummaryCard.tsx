import { Card } from '@/components/ui/card';
import { Sun, Zap, TrendingUp, TrendingDown } from 'lucide-react';
import type { UserHomeLatest, UserDailyStats } from '@/hooks/useUserData';
import { formatKw, formatKwh } from '@/lib/formatters';

interface HomeSummaryCardProps {
  homeLatest: UserHomeLatest | null;
  dailyStats: UserDailyStats | null;
}

export function HomeSummaryCard({ homeLatest, dailyStats }: HomeSummaryCardProps) {
  const pvNow = Math.round((homeLatest?.pv_w || 0) / 1000);
  const loadNow = Math.round((homeLatest?.load_w || 0) / 1000);
  const pvToday = Math.round((dailyStats?.prod_wh || 0) / 1000);
  const useToday = Math.round((dailyStats?.use_wh || 0) / 1000);
  const surplus = pvToday - useToday;
  const stats = [
    {
      label: 'Solar Production',
      now: pvNow,
      today: pvToday,
      icon: Sun,
      color: 'text-surplus',
      bgColor: 'bg-surplus-light',
    },
    {
      label: 'Consumption',
      now: loadNow,
      today: useToday,
      icon: Zap,
      color: 'text-consumption',
      bgColor: 'bg-consumption-light',
    },
  ];

  return (
    <Card className="p-6 bg-gradient-card">
      <h2 className="text-xl font-bold mb-4">Energy Summary</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {stats.map(stat => (
          <div key={stat.label} className="flex items-start gap-3">
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color} tabular-nums`}>
                {formatKw(stat.now)}
                <span className="text-lg ml-1">kW</span>
              </p>
              <p className="text-sm text-muted-foreground mt-1 tabular-nums">
                {formatKwh(stat.today)} kWh today
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Surplus Today</span>
          <div className="flex items-center gap-2">
            {surplus >= 0 ? (
              <TrendingUp className="h-4 w-4 text-surplus" />
            ) : (
              <TrendingDown className="h-4 w-4 text-grid-import" />
            )}
            <span className={`text-xl font-bold tabular-nums ${surplus >= 0 ? 'text-surplus' : 'text-grid-import'}`}>
              {surplus >= 0 ? '+' : ''}{formatKwh(surplus)} kWh
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
