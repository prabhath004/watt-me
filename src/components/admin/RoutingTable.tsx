/**
 * Routing Table - Display producer-to-consumer energy routing for selected hour
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
import { ArrowRight, Info } from "lucide-react";
import type { RoutingPair } from "@/types/community";

interface RoutingTableProps {
  pairs: RoutingPair[];
  timestamp: string | null;
}

export function RoutingTable({ pairs, timestamp }: RoutingTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Energy Routing
          {timestamp && <span className="text-sm font-mono text-muted-foreground">@ {timestamp}</span>}
        </CardTitle>
        <CardDescription>
          Inferred producer-to-consumer pairings for this hour (greedy allocation)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pairs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Info className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No local routing at this hour
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Either no surplus available or no deficit to fill
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From (Producer)</TableHead>
                  <TableHead className="text-center w-[60px]"></TableHead>
                  <TableHead>To (Consumer)</TableHead>
                  <TableHead className="text-right">Energy (kWh)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pairs.map((pair, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium font-mono">{pair.from_home}</TableCell>
                    <TableCell className="text-center">
                      <ArrowRight className="h-4 w-4 text-green-500 mx-auto" />
                    </TableCell>
                    <TableCell className="font-medium font-mono">{pair.to_home}</TableCell>
                    <TableCell className="text-right font-mono">{pair.kwh.toFixed(3)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-3 pt-3 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Routed:</span>
                <span className="font-mono font-semibold">
                  {pairs.reduce((sum, p) => sum + p.kwh, 0).toFixed(3)} kWh
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

