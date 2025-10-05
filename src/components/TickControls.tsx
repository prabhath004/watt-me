import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface TickControlsProps {
  onTick: () => void;
  lastUpdate?: string;
}

export function TickControls({ onTick, lastUpdate }: TickControlsProps) {
  return (
    <div className="flex items-center gap-3">
      {lastUpdate && (
        <span className="text-sm text-muted-foreground">
          Last update: {new Date(lastUpdate).toLocaleTimeString()}
        </span>
      )}
      <Button
        onClick={onTick}
        variant="outline"
        size="sm"
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Next Frame
      </Button>
    </div>
  );
}
