/**
 * Home Snapshot Table - Final state for each home
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Battery, TrendingUp, TrendingDown } from "lucide-react";
import type { HomeSnapshot } from "@/types/community";

interface HomeSnapshotTableProps {
  snapshots: HomeSnapshot[];
}

export function HomeSnapshotTable({ snapshots }: HomeSnapshotTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Home Snapshots</CardTitle>
        <CardDescription>
          Final battery SOC and credit balance for each home
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Home</TableHead>
                <TableHead>Solar (kW)</TableHead>
                <TableHead>Battery (kWh)</TableHead>
                <TableHead>
                  <div className="flex items-center gap-1">
                    <Battery className="h-3 w-3" />
                    SOC
                  </div>
                </TableHead>
                <TableHead className="text-right">Credits (kWh)</TableHead>
                <TableHead className="text-right">Net Period (kWh)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {snapshots.map((snapshot) => (
                <TableRow key={snapshot.home_id}>
                  <TableCell className="font-medium font-mono">
                    {snapshot.home_id}
                  </TableCell>
                  <TableCell>{snapshot.solar_capacity_kw.toFixed(1)}</TableCell>
                  <TableCell>{snapshot.battery_capacity_kwh.toFixed(1)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{snapshot.battery_soc_pct.toFixed(1)}%</span>
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            snapshot.battery_soc_pct > 60
                              ? "bg-green-500"
                              : snapshot.battery_soc_pct > 30
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${snapshot.battery_soc_pct}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={snapshot.credits_balance_kwh >= 0 ? "default" : "secondary"}
                      className={
                        snapshot.credits_balance_kwh >= 0
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                      }
                    >
                      {snapshot.credits_balance_kwh >= 0 ? "+" : ""}
                      {snapshot.credits_balance_kwh.toFixed(2)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    <div className="flex items-center justify-end gap-1">
                      {snapshot.net_period_kwh > 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : snapshot.net_period_kwh < 0 ? (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      ) : null}
                      <span className={snapshot.net_period_kwh >= 0 ? "text-green-600" : "text-red-600"}>
                        {snapshot.net_period_kwh >= 0 ? "+" : ""}
                        {snapshot.net_period_kwh.toFixed(2)}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

