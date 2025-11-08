import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Camera, 
  Move, 
  Lightbulb, 
  Palette, 
  Focus, 
  Timer,
  Sparkles
} from "lucide-react";

export const CATEGORIES = [
  { id: "camera-angles", label: "Camera Angles", icon: Camera },
  { id: "camera-motion", label: "Camera Motion", icon: Move },
  { id: "lighting", label: "Lighting", icon: Lightbulb },
  { id: "style", label: "Style", icon: Sparkles },
  { id: "depth-of-field", label: "Depth of Field", icon: Focus },
  { id: "motion-timing", label: "Motion/Timing", icon: Timer },
  { id: "color-palette", label: "Color Palette", icon: Palette },
] as const;

export type CategoryId = typeof CATEGORIES[number]['id'];

interface CategoryTabsProps {
  value: CategoryId;
  onChange: (value: CategoryId) => void;
}

export default function CategoryTabs({ value, onChange }: CategoryTabsProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as CategoryId)} className="w-full">
      <TabsList className="w-full justify-start h-auto flex-wrap gap-2 bg-transparent p-0">
        {CATEGORIES.map((category) => {
          const Icon = category.icon;
          return (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              data-testid={`tab-${category.id}`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{category.label}</span>
              <span className="sm:hidden">{category.label.split(' ')[0]}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
