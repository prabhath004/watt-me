import { Card } from '@/components/ui/card';
import { Sun, Zap, Download, Upload } from 'lucide-react';
import type { CommunityToday } from '@/hooks/useAdminData';
import { formatKwh } from '@/lib/formatters';

interface CommunityTotalsProps {
  communityToday: CommunityToday | null;
}

export function CommunityTotals({ communityToday }: CommunityTotalsProps) {

  const stats = [
    {
      label: 'Production',
      value: Math.round((communityToday?.prod_wh || 0) / 1000),
      icon: Sun,
      color: 'text-surplus',
      bgColor: 'bg-surplus-light',
    },
    {
      label: 'Microgrid Used',
      value: Math.round((communityToday?.mg_used_wh || 0) / 1000),
      icon: Zap,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Grid Import',
      value: Math.round((communityToday?.grid_import_wh || 0) / 1000),
      icon: Download,
      color: 'text-grid-import',
      bgColor: 'bg-destructive/10',
    },
    {
      label: 'Grid Export',
      value: Math.round((communityToday?.grid_export_wh || 0) / 1000),
      icon: Upload,
      color: 'text-grid-export',
      bgColor: 'bg-grid-export/10',
    },
  ];

  return (
    <Card className="p-6 bg-gradient-card">
      <h2 className="text-xl font-bold mb-4">Community Overview (Today)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color} tabular-nums`}>
                {formatKwh(stat.value)}
                <span className="text-sm ml-1">kWh</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
