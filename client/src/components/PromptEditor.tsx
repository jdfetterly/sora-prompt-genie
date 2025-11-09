import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface PromptEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isEnhancing?: boolean;
}

export default function PromptEditor({ value, onChange, placeholder, isEnhancing = false }: PromptEditorProps) {
  const charCount = value.length;
  const [showCompleteAnimation, setShowCompleteAnimation] = useState(false);
  const prevEnhancingRef = useRef(isEnhancing);
  
  useEffect(() => {
    // When enhancement completes (transitions from true to false)
    if (prevEnhancingRef.current && !isEnhancing) {
      setShowCompleteAnimation(true);
      const timer = setTimeout(() => {
        setShowCompleteAnimation(false);
      }, 500); // Match text-fade-in animation duration
      return () => clearTimeout(timer);
    }
    prevEnhancingRef.current = isEnhancing;
  }, [isEnhancing]);
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="prompt-input" className="text-sm font-medium">
          Your Prompt
        </Label>
        <span className={cn(
          "text-xs transition-colors",
          isEnhancing ? "character-count-enhancing" : "text-muted-foreground"
        )}>
          {isEnhancing ? "Enhancing..." : `${charCount} characters`}
        </span>
      </div>
      
      <div className={cn(
        "relative",
        isEnhancing && "prompt-enhancing",
        showCompleteAnimation && "prompt-enhancing-complete"
      )}>
        {isEnhancing && (
          <div className="sparkle-container">
            <div className="sparkle" />
            <div className="sparkle" />
            <div className="sparkle" />
            <div className="sparkle" />
            <div className="sparkle" />
            <div className="sparkle" />
            <div className="sparkle" />
            <div className="sparkle" />
            <div className="sparkle" />
            <div className="sparkle" />
            <div className="sparkle" />
            <div className="sparkle" />
          </div>
        )}
        <Textarea
          id="prompt-input"
          data-testid="input-prompt"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Enter your video prompt here..."}
          className="min-h-[200px] font-mono text-sm resize-none relative"
          disabled={isEnhancing}
        />
      </div>
    </div>
  );
}
