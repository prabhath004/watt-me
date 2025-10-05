/**
 * Community KPI Cards - Display production, microgrid usage, grid import
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Users, Grid3x3 } from "lucide-react";
import type { CommunityTotals } from "@/types/community";

interface CommunityKPIsProps {
  totals: CommunityTotals;
}

export function CommunityKPIs({ totals }: CommunityKPIsProps) {
  const { production_kwh, microgrid_used_kwh, grid_import_kwh } = totals;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Production Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Production</CardTitle>
          <Zap className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{production_kwh.toFixed(1)} kWh</div>
          <p className="text-xs text-muted-foreground mt-1">
            Community solar generation
          </p>
        </CardContent>
      </Card>

      {/* Microgrid Used Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Microgrid Shared</CardTitle>
          <Users className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{microgrid_used_kwh.toFixed(1)} kWh</div>
          <p className="text-xs text-muted-foreground mt-1">
            Locally shared energy
          </p>
        </CardContent>
      </Card>

      {/* Grid Import Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Grid Import</CardTitle>
          <Grid3x3 className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{grid_import_kwh.toFixed(1)} kWh</div>
          <p className="text-xs text-muted-foreground mt-1">
            External grid usage
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

