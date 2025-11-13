import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PRESETS, type Preset } from "@/lib/enhancements";
import { Sparkles } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface PresetSelectorProps {
  onPresetSelect: (preset: Preset) => void;
  disabled?: boolean;
}

export default function PresetSelector({ onPresetSelect, disabled }: PresetSelectorProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-sm">Quick Presets</h3>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {PRESETS.map((preset) => (
          <Tooltip key={preset.id}>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPresetSelect(preset)}
                disabled={disabled}
                className="h-auto py-2 px-3"
                data-testid={`preset-${preset.id}`}
              >
                <span className="font-semibold text-xs">{preset.name}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="font-medium mb-1">{preset.name}</p>
              <p className="text-xs">{preset.description}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </Card>
  );
}
