import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sparkles } from "lucide-react";

const STARTER_PROMPTS = [
  "A serene beach at sunset with gentle waves",
  "Bustling city street in the rain at night",
  "Mountain landscape with morning fog rolling through valleys",
  "Cozy coffee shop interior with warm lighting",
  "Forest path with dappled sunlight filtering through trees",
  "Modern kitchen with chef preparing a meal",
];

interface StarterPromptsProps {
  onSelect: (prompt: string) => void;
}

export default function StarterPrompts({ onSelect }: StarterPromptsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" data-testid="button-starter-prompts">
          <Sparkles className="w-4 h-4" />
          Starter Prompts
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80">
        {STARTER_PROMPTS.map((prompt, index) => (
          <DropdownMenuItem
            key={index}
            onClick={() => onSelect(prompt)}
            className="cursor-pointer"
            data-testid={`starter-prompt-${index}`}
          >
            <span className="text-sm">{prompt}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
