/**
 * Hour Selector - Choose which hour to view routing details
 */

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock } from "lucide-react";

interface HourSelectorProps {
  hours: string[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
}

export function HourSelector({
  hours,
  selectedIndex,
  onSelectIndex,
}: HourSelectorProps) {
  if (hours.length === 0) return null;

  const selectedHour = hours[selectedIndex];
  const date = selectedHour.split(" ")[0];
  const time = selectedHour.split(" ")[1];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-semibold">Hour Selection</Label>
          <p className="text-sm text-muted-foreground">
            View energy routing for a specific hour
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono">{date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono">{time}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Slider for quick navigation */}
        <div className="flex-1">
          <Slider
            value={[selectedIndex]}
            onValueChange={(values) => onSelectIndex(values[0])}
            max={hours.length - 1}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{hours[0]}</span>
            <span>Hour {selectedIndex + 1} of {hours.length}</span>
            <span>{hours[hours.length - 1]}</span>
          </div>
        </div>

        {/* Dropdown for precise selection */}
        <Select
          value={selectedIndex.toString()}
          onValueChange={(value) => onSelectIndex(parseInt(value))}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {hours.map((hour, idx) => (
              <SelectItem key={idx} value={idx.toString()}>
                {hour}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

