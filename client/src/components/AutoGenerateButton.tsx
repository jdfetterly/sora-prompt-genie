import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface AutoGenerateButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isGenerating?: boolean;
  wordCount: number;
}

export default function AutoGenerateButton({ 
  onClick, 
  disabled, 
  isGenerating,
  wordCount 
}: AutoGenerateButtonProps) {
  const hasMinimumWords = wordCount >= 3;
  const isDisabled = disabled || isGenerating || !hasMinimumWords;
  
  const handleClick = () => {
    if (!isDisabled) {
      onClick();
    }
  };

  if (!hasMinimumWords) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2" 
              data-testid="button-auto-generate"
              onClick={handleClick}
              aria-disabled={true}
              disabled={true}
            >
              <Sparkles className="w-4 h-4" />
              {isGenerating ? "Generating..." : "Auto-Generate"}
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Enter at least 3 words to auto-generate a prompt</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="gap-2" 
      data-testid="button-auto-generate"
      onClick={handleClick}
      disabled={isDisabled}
    >
      <Sparkles className="w-4 h-4" />
      {isGenerating ? "Generating..." : "Auto-Generate"}
    </Button>
  );
}
