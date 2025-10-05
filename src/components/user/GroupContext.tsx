import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, Users, Zap } from 'lucide-react';
import type { UserSharing } from '@/data/MockDataProvider';
import { formatKw } from '@/lib/formatters';

interface GroupContextProps {
  sharing: UserSharing;
}

export function GroupContext({ sharing }: GroupContextProps) {
  return (
    <Card className="p-6 bg-gradient-card">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">Microgrid Sharing</h2>
      </div>

      <div className="space-y-4">
        {/* Current Flow */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ArrowUp className="h-4 w-4 text-surplus" />
              <span className="text-sm text-muted-foreground">Sharing Now</span>
            </div>
            <p className="text-2xl font-bold text-surplus tabular-nums">
              {formatKw(sharing.to_microgrid_now_kw)} kW
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ArrowDown className="h-4 w-4 text-consumption" />
              <span className="text-sm text-muted-foreground">Receiving Now</span>
            </div>
            <p className="text-2xl font-bold text-consumption tabular-nums">
              {formatKw(sharing.from_microgrid_now_kw)} kW
            </p>
          </div>
        </div>

        {/* Partners */}
        <div className="pt-4 border-t">
          {sharing.partners.to.length > 0 && (
            <div className="mb-3">
              <p className="text-sm text-muted-foreground mb-2">Sharing with:</p>
              <div className="flex flex-wrap gap-2">
                {sharing.partners.to.map(partner => (
                  <Badge key={partner} variant="outline" className="border-surplus text-surplus">
                    {partner}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {sharing.partners.from.length > 0 && (
            <div className="mb-3">
              <p className="text-sm text-muted-foreground mb-2">Receiving from:</p>
              <div className="flex flex-wrap gap-2">
                {sharing.partners.from.map(partner => (
                  <Badge key={partner} variant="outline" className="border-consumption text-consumption">
                    {partner}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {sharing.partners.to.length === 0 && sharing.partners.from.length === 0 && (
            <p className="text-sm text-muted-foreground">No active sharing</p>
          )}
        </div>

        {/* Unused Surplus */}
        {sharing.unused_surplus_to_grid_now_kw > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-grid-export/10 border border-grid-export/20">
              <Zap className="h-4 w-4 text-grid-export" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Unused surplus → grid</p>
                <p className="text-lg font-bold text-grid-export tabular-nums">
                  {formatKw(sharing.unused_surplus_to_grid_now_kw)} kW
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
