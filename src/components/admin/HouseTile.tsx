import { Card } from '@/components/ui/card';
import { Sun, Zap, ArrowUp, ArrowDown, Battery } from 'lucide-react';
import type { AdminHouse } from '@/data/MockDataProvider';

interface HouseTileProps {
  house: AdminHouse;
}

export function HouseTile({ house }: HouseTileProps) {
  const batteryColor = 
    house.battery_soc_pct > 60 ? 'text-surplus' :
    house.battery_soc_pct > 30 ? 'text-consumption' :
    'text-destructive';

  return (
    <Card className="p-4 hover:shadow-card transition-shadow bg-gradient-card">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-bold">{house.id}</h3>
        <div className={`flex items-center gap-1 ${batteryColor}`}>
          <Battery className="h-4 w-4" />
          <span className="text-sm font-medium">{house.battery_soc_pct}%</span>
        </div>
      </div>

      <div className="space-y-2">
        {/* Solar */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Sun className="h-3.5 w-3.5" />
            <span>Solar</span>
          </div>
          <div className="text-right">
            <div className="font-medium">{house.solar_now_kw.toFixed(2)} kW</div>
            <div className="text-xs text-muted-foreground">{house.solar_today_kwh.toFixed(1)} kWh today</div>
          </div>
        </div>

        {/* Consumption */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Zap className="h-3.5 w-3.5" />
            <span>Usage</span>
          </div>
          <div className="text-right">
            <div className="font-medium">{house.consumption_now_kw.toFixed(2)} kW</div>
            <div className="text-xs text-muted-foreground">{house.consumption_today_kwh.toFixed(1)} kWh today</div>
          </div>
        </div>

        {/* To Microgrid */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-surplus">
            <ArrowUp className="h-3.5 w-3.5" />
            <span>Sharing</span>
          </div>
          <div className="text-right">
            <div className="font-medium text-surplus">{house.to_microgrid_now_kw.toFixed(2)} kW</div>
            <div className="text-xs text-muted-foreground">{house.to_microgrid_today_kwh.toFixed(1)} kWh today</div>
          </div>
        </div>

        {/* From Microgrid */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-consumption">
            <ArrowDown className="h-3.5 w-3.5" />
            <span>Receiving</span>
          </div>
          <div className="text-right">
            <div className="font-medium text-consumption">{house.from_microgrid_now_kw.toFixed(2)} kW</div>
            <div className="text-xs text-muted-foreground">{house.from_microgrid_today_kwh.toFixed(1)} kWh today</div>
          </div>
        </div>

        {/* Credits */}
        <div className="pt-2 border-t mt-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Credits (Net)</span>
            <span className={`font-bold ${house.credits_month_net_kwh >= 0 ? 'text-surplus' : 'text-consumption'}`}>
              {house.credits_month_net_kwh >= 0 ? '+' : ''}{house.credits_month_net_kwh.toFixed(1)} kWh
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
