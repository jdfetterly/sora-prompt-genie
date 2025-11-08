import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Enhancement {
  id: string;
  title: string;
  description: string;
  category: string;
}

interface EnhancementCardProps {
  enhancement: Enhancement;
  isApplied: boolean;
  onClick: () => void;
}

export default function EnhancementCard({ enhancement, isApplied, onClick }: EnhancementCardProps) {
  return (
    <Card
      className={cn(
        "p-4 cursor-pointer transition-all hover-elevate active-elevate-2 relative",
        isApplied && "border-primary bg-primary/5"
      )}
      onClick={onClick}
      data-testid={`card-enhancement-${enhancement.id}`}
    >
      {isApplied && (
        <div className="absolute top-2 right-2">
          <div className="bg-primary text-primary-foreground rounded-full p-1">
            <Check className="w-3 h-3" />
          </div>
        </div>
      )}
      
      <div className="space-y-1 pr-6">
        <h3 className="font-medium text-sm">{enhancement.title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {enhancement.description}
        </p>
      </div>
    </Card>
  );
}
