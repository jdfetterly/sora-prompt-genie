import { Clapperboard } from "lucide-react";
import ModeToggle, { type Mode } from "@/components/ModeToggle";

interface HeaderProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
}

export default function Header({ mode, onModeChange }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clapperboard className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <h1 className="text-xl md:text-2xl font-semibold">
              Sora Prompt Builder
            </h1>
          </div>
          
          <ModeToggle mode={mode} onChange={onModeChange} />
        </div>
      </div>
    </header>
  );
}


