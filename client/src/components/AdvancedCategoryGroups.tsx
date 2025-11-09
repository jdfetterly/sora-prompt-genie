import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CATEGORY_GROUPS } from "./CategoryTabs";
import EnhancementGrid from "./EnhancementGrid";
import type { Enhancement } from "./EnhancementCard";
import type { CategoryId, CategoryGroupId } from "./CategoryTabs";
import { cn } from "@/lib/utils";

interface AdvancedCategoryGroupsProps {
  enhancements: Record<CategoryId, Enhancement[]>;
  customSuggestions: Record<string, Enhancement[]>;
  appliedIds: Set<string>;
  onEnhancementClick: (enhancement: Enhancement) => void;
  onRefresh: (category: CategoryId) => void;
  isRefreshing: Record<CategoryId, boolean>;
}

export default function AdvancedCategoryGroups({
  enhancements,
  customSuggestions,
  appliedIds,
  onEnhancementClick,
  onRefresh,
  isRefreshing,
}: AdvancedCategoryGroupsProps) {
  // Track selected top-level category (only one can be selected at a time)
  const [selectedTopLevel, setSelectedTopLevel] = useState<CategoryGroupId>("camera");
  
  // Track selected subcategory for the selected top-level category
  const [selectedSubcategory, setSelectedSubcategory] = useState<CategoryId | null>(() => {
    const cameraGroup = CATEGORY_GROUPS.find(g => g.id === "camera");
    return cameraGroup && cameraGroup.categories.length > 0 ? cameraGroup.categories[0].id : null;
  });

  const handleTopLevelClick = (groupId: CategoryGroupId) => {
    const eventName = "top_level_category_selected";
    const payload = {
      button_type: "top_level_category",
      filter_category: groupId,
      location: "advanced_mode",
      debug_mode: true,
    };
    
    console.log("GTAG EVENT:", eventName, payload);
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", eventName, payload);
    }
    
    setSelectedTopLevel(groupId);
    
    // Set the first subcategory as selected when switching top-level
    const group = CATEGORY_GROUPS.find(g => g.id === groupId);
    if (group && group.categories.length > 0) {
      setSelectedSubcategory(group.categories[0].id);
    } else {
      setSelectedSubcategory(null);
    }
  };

  const handleSubcategoryClick = (categoryId: CategoryId) => {
    const eventName = "subcategory_selected";
    const payload = {
      button_type: "subcategory_toggle",
      filter_category: categoryId,
      location: "advanced_mode",
      debug_mode: true,
    };
    
    console.log("GTAG EVENT:", eventName, payload);
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", eventName, payload);
    }
    
    setSelectedSubcategory(categoryId);
  };

  const selectedGroup = CATEGORY_GROUPS.find(g => g.id === selectedTopLevel);

  return (
    <div className="space-y-6">
      {/* Top-level category buttons */}
      <div className="flex flex-wrap gap-2">
        {CATEGORY_GROUPS.map((group) => {
          const isSelected = selectedTopLevel === group.id;
          
          return (
            <Button
              key={group.id}
              variant={isSelected ? "default" : "outline"}
              size="default"
              onClick={() => handleTopLevelClick(group.id)}
              className={cn(
                "gap-2",
                isSelected 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "bg-background text-foreground"
              )}
              data-testid={`top-level-button-${group.id}`}
            >
              <span>{group.label}</span>
            </Button>
          );
        })}
      </div>

      {/* Sub-category buttons (only shown for selected top-level) */}
      {selectedGroup && selectedGroup.categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedGroup.categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedSubcategory === category.id;
            
            return (
              <Button
                key={category.id}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => handleSubcategoryClick(category.id)}
                className={cn(
                  "gap-2",
                  isSelected 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "bg-background text-foreground"
                )}
                data-testid={`subcategory-button-${category.id}`}
              >
                <Icon className="w-4 h-4" />
                <span>{category.label}</span>
              </Button>
            );
          })}
        </div>
      )}

      {/* EnhancementGrid for selected subcategory */}
      {selectedSubcategory && (
        <div>
          <EnhancementGrid
            enhancements={customSuggestions[selectedSubcategory] || enhancements[selectedSubcategory] || []}
            appliedIds={appliedIds}
            onEnhancementClick={onEnhancementClick}
            onRefresh={() => onRefresh(selectedSubcategory)}
            categoryLabel={selectedGroup?.categories.find(c => c.id === selectedSubcategory)?.label || ""}
            isRefreshing={isRefreshing[selectedSubcategory] || false}
          />
        </div>
      )}
    </div>
  );
}
