import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CATEGORY_GROUPS } from "./CategoryTabs";
import EnhancementGrid from "./EnhancementGrid";
import type { Enhancement } from "./EnhancementCard";
import type { CategoryId } from "./CategoryTabs";

interface AdvancedCategoryGroupsProps {
  enhancements: Record<CategoryId, Enhancement[]>;
  appliedIds: Set<string>;
  onEnhancementClick: (enhancement: Enhancement) => void;
  onRefresh: (category: CategoryId) => void;
  isRefreshing: Record<CategoryId, boolean>;
}

export default function AdvancedCategoryGroups({
  enhancements,
  appliedIds,
  onEnhancementClick,
  onRefresh,
  isRefreshing,
}: AdvancedCategoryGroupsProps) {
  const [openGroups, setOpenGroups] = useState<string[]>(["camera"]);

  return (
    <Accordion
      type="multiple"
      value={openGroups}
      onValueChange={setOpenGroups}
      className="space-y-2"
    >
      {CATEGORY_GROUPS.map((group) => (
        <AccordionItem
          key={group.id}
          value={group.id}
          className="border rounded-lg px-4"
          data-testid={`accordion-group-${group.id}`}
        >
          <AccordionTrigger className="hover:no-underline py-3">
            <span className="font-semibold">{group.label}</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-6 pt-2">
              {group.categories.map((category) => {
                const categoryEnhancements = enhancements[category.id] || [];
                return (
                  <div key={category.id}>
                    <EnhancementGrid
                      enhancements={categoryEnhancements}
                      appliedIds={appliedIds}
                      onEnhancementClick={onEnhancementClick}
                      onRefresh={() => onRefresh(category.id)}
                      categoryLabel={category.label}
                      isRefreshing={isRefreshing[category.id] || false}
                    />
                  </div>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
