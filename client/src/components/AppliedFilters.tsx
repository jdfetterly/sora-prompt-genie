import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Enhancement } from "./EnhancementCard";
import { ALL_CATEGORIES, type CategoryId } from "./CategoryTabs";

interface AppliedFiltersProps {
  appliedIds: Set<string>;
  enhancements: Record<CategoryId, Enhancement[]>;
  customSuggestions: Record<string, Enhancement[]>;
  onRemove: (enhancement: Enhancement) => void;
}

export default function AppliedFilters({
  appliedIds,
  enhancements,
  customSuggestions,
  onRemove,
}: AppliedFiltersProps) {
  // Collect all applied enhancements with their details
  const appliedEnhancements: Enhancement[] = [];
  
  // Check all categories for applied enhancements
  const allCategories = ALL_CATEGORIES.map(c => c.id);
  
  allCategories.forEach((categoryId) => {
    const categoryEnhancements = [
      ...(enhancements[categoryId] || []),
      ...(customSuggestions[categoryId] || []),
    ];
    
    categoryEnhancements.forEach((enhancement) => {
      if (appliedIds.has(enhancement.id)) {
        appliedEnhancements.push(enhancement);
      }
    });
  });
  
  if (appliedEnhancements.length === 0) {
    return null;
  }
  
  // Get category label helper
  const getCategoryLabel = (categoryId: string): string => {
    const category = ALL_CATEGORIES.find(c => c.id === categoryId);
    return category?.label || categoryId;
  };
  
  const handleRemove = (enhancement: Enhancement) => {
    const eventName = "filter_removed";
    const payload = {
      button_type: "remove_filter",
      filter_category: enhancement.category,
      location: "applied_filters",
      debug_mode: true,
    };
    
    console.log("GTAG EVENT:", eventName, payload);
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", eventName, payload);
    }
    
    onRemove(enhancement);
  };
  
  return (
    <div className="space-y-2 mb-6">
      <h3 className="text-sm font-medium text-muted-foreground">Applied Filters</h3>
      <div className="flex flex-wrap gap-2">
        {appliedEnhancements.map((enhancement) => (
          <Badge
            key={enhancement.id}
            variant="secondary"
            className="gap-1.5 pr-1.5 pl-2.5 py-1"
          >
            <span className="text-xs">
              <span className="font-medium">{enhancement.title}</span>
              <span className="text-muted-foreground ml-1">
                ({getCategoryLabel(enhancement.category)})
              </span>
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(enhancement);
              }}
              className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5 transition-colors"
              aria-label={`Remove ${enhancement.title}`}
              data-testid={`remove-filter-${enhancement.id}`}
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}

