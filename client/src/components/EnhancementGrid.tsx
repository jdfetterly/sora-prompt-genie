import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
import EnhancementCard, { type Enhancement } from "./EnhancementCard";
import { Badge } from "@/components/ui/badge";

interface EnhancementGridProps {
  enhancements: Enhancement[];
  appliedIds: Set<string>;
  onEnhancementClick: (enhancement: Enhancement) => void;
  onRefresh: () => void;
  categoryLabel: string;
  isRefreshing?: boolean;
  processingEnhancementId?: string | null;
}

export default function EnhancementGrid({
  enhancements,
  appliedIds,
  onEnhancementClick,
  onRefresh,
  categoryLabel,
  isRefreshing = false,
  processingEnhancementId = null,
}: EnhancementGridProps) {
  const appliedCount = enhancements.filter(e => appliedIds.has(e.id)).length;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">{categoryLabel}</h2>
          {appliedCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {appliedCount} applied
            </Badge>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="gap-2 refresh-button-pulse"
          data-testid="button-refresh-suggestions"
        >
          {isRefreshing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Refresh
            </>
          )}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {enhancements.map((enhancement) => (
          <EnhancementCard
            key={enhancement.id}
            enhancement={enhancement}
            isApplied={appliedIds.has(enhancement.id)}
            isProcessing={processingEnhancementId === enhancement.id}
            onClick={() => onEnhancementClick(enhancement)}
          />
        ))}
      </div>
    </div>
  );
}
