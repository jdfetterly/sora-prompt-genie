import { Card } from "@/components/ui/card";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import type { CategoryId } from "./CategoryTabs";

export interface Enhancement {
  id: string;
  title: string;
  description: string;
  category: CategoryId;
}

interface EnhancementCardProps {
  enhancement: Enhancement;
  isApplied: boolean;
  isProcessing?: boolean;
  onClick: () => void;
}

export default function EnhancementCard({ enhancement, isApplied, isProcessing = false, onClick }: EnhancementCardProps) {
  return (
    <Card
      className={cn(
        "p-4 cursor-pointer transition-all hover-elevate active-elevate-2 relative",
        isApplied && "border-primary bg-primary/5",
        isProcessing && "enhancement-card-processing"
      )}
      onClick={isProcessing ? undefined : onClick}
      data-testid={`card-enhancement-${enhancement.id}`}
    >
      {isProcessing && (
        <div className="enhancement-card-spinner">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      )}
      
      {isApplied && !isProcessing && (
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-primary text-primary-foreground rounded-full p-1">
            <Check className="w-3 h-3" />
          </div>
        </div>
      )}
      
      <div className={cn("space-y-1 pr-6", isProcessing && "opacity-60")}>
        <h3 className="font-medium text-sm">{enhancement.title}</h3>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="block w-full">
              <p className="text-xs text-muted-foreground line-clamp-2">
                {enhancement.description}
              </p>
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <p>{enhancement.description}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </Card>
  );
}
