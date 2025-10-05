import { Card } from '@/components/ui/card';
import { Upload, Download } from 'lucide-react';
import { formatKw } from '@/lib/formatters';
import type { GridExchangeNow, HomeLatest } from '@/hooks/useAdminData';

interface GridExchangeCardProps {
  gridExchange: GridExchangeNow | null;
  homes: HomeLatest[];
}

export function GridExchangeCard({ gridExchange, homes }: GridExchangeCardProps) {
  const toGridNow = gridExchange?.to_grid_now_w_total || 0;
  const fromGridNow = gridExchange?.from_grid_now_w_total || 0;
  
  const exporters = homes.filter(h => h.grid_export_w > 50).slice(0, 5);
  const importers = homes.filter(h => h.grid_import_w > 50).slice(0, 5);

  return (
    <Card className="p-6 bg-gradient-card rounded-2xl shadow-card">
      <h2 className="text-xl font-semibold mb-6">Grid Exchange (Now)</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - To Grid (Export) */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Upload className="h-5 w-5 text-grid-export" />
            <h3 className="font-semibold text-foreground">To Grid (Export)</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Now</p>
              <p className="text-4xl font-semibold text-grid-export tabular-nums">
                {formatKw(Math.round(toGridNow / 1000))}
                <span className="text-lg ml-2">kW</span>
              </p>
            </div>

            {exporters.length > 0 && (
              <div className="pt-3 border-t border-border/60">
                <p className="text-xs text-muted-foreground mb-2">Top exporters now</p>
                <div className="space-y-1">
                  {exporters.map((home) => (
                    <div key={home.home_id} className="flex justify-between text-sm">
                      <span>{home.home_id}</span>
                      <span className="font-semibold text-grid-export tabular-nums">
                        {formatKw(Math.round(home.grid_export_w / 1000))} kW
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - From Grid (Import) */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Download className="h-5 w-5 text-grid-import" />
            <h3 className="font-semibold text-foreground">From Grid (Import)</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Now (Total)</p>
              <p className="text-4xl font-semibold text-grid-import tabular-nums">
                {formatKw(Math.round(fromGridNow / 1000))}
                <span className="text-lg ml-2">kW</span>
              </p>
            </div>

            {importers.length > 0 ? (
              <div className="pt-3 border-t border-border/60">
                <p className="text-xs text-muted-foreground mb-2">Houses importing now</p>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {importers.map((home) => (
                    <div
                      key={home.home_id}
                      className="flex items-center justify-between p-2 rounded-lg bg-grid-import/10 border border-grid-import/20"
                    >
                      <span className="font-medium text-foreground">{home.home_id}</span>
                      <span className="text-sm font-semibold text-grid-import tabular-nums">
                        {formatKw(Math.round(home.grid_import_w / 1000))} kW
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground pt-3 border-t border-border/60">
                No houses importing from grid
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
