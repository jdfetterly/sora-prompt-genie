import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface PromptEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function PromptEditor({ value, onChange, placeholder }: PromptEditorProps) {
  const charCount = value.length;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="prompt-input" className="text-sm font-medium">
          Your Prompt
        </Label>
        <span className="text-xs text-muted-foreground">
          {charCount} characters
        </span>
      </div>
      
      <Textarea
        id="prompt-input"
        data-testid="input-prompt"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Enter your video prompt here..."}
        className="min-h-[200px] font-mono text-sm resize-none"
      />
    </div>
  );
}
