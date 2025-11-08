import { Button } from "@/components/ui/button";
import { Settings2, Zap } from "lucide-react";

export type Mode = "simple" | "advanced";

interface ModeToggleProps {
  mode: Mode;
  onChange: (mode: Mode) => void;
}

export default function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="flex items-center gap-2 p-1 bg-muted rounded-lg w-fit">
      <Button
        variant={mode === "simple" ? "default" : "ghost"}
        size="sm"
        onClick={() => onChange("simple")}
        className="gap-2 h-8"
        data-testid="mode-simple"
      >
        <Zap className="w-3.5 h-3.5" />
        Simple
      </Button>
      <Button
        variant={mode === "advanced" ? "default" : "ghost"}
        size="sm"
        onClick={() => onChange("advanced")}
        className="gap-2 h-8"
        data-testid="mode-advanced"
      >
        <Settings2 className="w-3.5 h-3.5" />
        Advanced
      </Button>
    </div>
  );
}
