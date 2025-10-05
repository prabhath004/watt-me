import { Card } from '@/components/ui/card';
import { Coins, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import type { UserDailyStats } from '@/hooks/useUserData';
import { formatCredits, formatKwh } from '@/lib/formatters';

interface CreditsCardProps {
  dailyStats: UserDailyStats | null;
}

export function CreditsCard({ dailyStats }: CreditsCardProps) {
  const netCredits = Math.round((dailyStats?.credits_net_wh || 0) / 1000);
  const mgUsed = Math.round((dailyStats?.mg_used_wh || 0) / 1000);
  return (
    <Card className="p-6 bg-gradient-card">
      <div className="flex items-center gap-2 mb-4">
        <Coins className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">Credits Balance</h2>
      </div>

      <div className="space-y-4">
        {/* Monthly Net */}
        <div className="text-center py-4 bg-gradient-hero rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Month-to-Date Net</p>
          <p className={`text-4xl font-bold tabular-nums ${netCredits >= 0 ? 'text-surplus' : 'text-consumption'}`}>
            {formatCredits(netCredits)}
            <span className="text-lg ml-1">kWh</span>
          </p>
        </div>

        {/* Today's Activity */}
        <div className="pt-4 border-t">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Microgrid Usage</h3>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Used Today</span>
            <span className="text-primary font-medium tabular-nums">{formatKwh(mgUsed)} kWh</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
