import { Button } from "@/components/ui/button";
import { Undo2, Redo2, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ActionBarProps {
  onUndo: () => void;
  onRedo: () => void;
  onCopy: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export default function ActionBar({ onUndo, onRedo, onCopy, canUndo, canRedo }: ActionBarProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const handleCopy = () => {
    onCopy();
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Prompt copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <Button
          size="icon"
          variant="ghost"
          onClick={onUndo}
          disabled={!canUndo}
          data-testid="button-undo"
          title="Undo"
        >
          <Undo2 className="w-4 h-4" />
        </Button>
        
        <Button
          size="icon"
          variant="ghost"
          onClick={onRedo}
          disabled={!canRedo}
          data-testid="button-redo"
          title="Redo"
        >
          <Redo2 className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="h-6 w-px bg-border" />
      
      <Button
        onClick={handleCopy}
        data-testid="button-copy"
        className="gap-2"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            Copy Prompt
          </>
        )}
      </Button>
    </div>
  );
}
