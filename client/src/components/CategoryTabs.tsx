import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Camera, 
  Move, 
  Lightbulb, 
  Palette, 
  Focus, 
  Timer,
  Sparkles,
  Cloud,
  Sun,
  Grid3X3,
  Heart,
  Shapes
} from "lucide-react";

// All available categories
export const ALL_CATEGORIES = [
  { id: "camera-angles", label: "Camera Angles", icon: Camera, group: "camera" },
  { id: "camera-motion", label: "Camera Motion", icon: Move, group: "camera" },
  { id: "lighting", label: "Lighting", icon: Lightbulb, group: "visuals" },
  { id: "color-palette", label: "Color Palette", icon: Palette, group: "visuals" },
  { id: "depth-of-field", label: "Depth of Field", icon: Focus, group: "visuals" },
  { id: "weather", label: "Weather & Atmosphere", icon: Cloud, group: "atmosphere" },
  { id: "time-of-day", label: "Time of Day", icon: Sun, group: "atmosphere" },
  { id: "mood", label: "Mood & Emotion", icon: Heart, group: "atmosphere" },
  { id: "style", label: "Style", icon: Sparkles, group: "polish" },
  { id: "motion-timing", label: "Motion/Timing", icon: Timer, group: "polish" },
  { id: "composition", label: "Composition", icon: Grid3X3, group: "polish" },
  { id: "texture", label: "Texture & Surface", icon: Shapes, group: "polish" },
] as const;

// Core categories for simple mode
export const CORE_CATEGORIES = [
  { id: "camera-angles", label: "Camera Angles", icon: Camera },
  { id: "lighting", label: "Lighting", icon: Lightbulb },
  { id: "style", label: "Style", icon: Sparkles },
  { id: "camera-motion", label: "Motion", icon: Move },
] as const;

// Category groups for advanced mode
export const CATEGORY_GROUPS = [
  { 
    id: "camera", 
    label: "📹 Camera", 
    categories: ALL_CATEGORIES.filter(c => c.group === "camera")
  },
  { 
    id: "visuals", 
    label: "💡 Visuals", 
    categories: ALL_CATEGORIES.filter(c => c.group === "visuals")
  },
  { 
    id: "atmosphere", 
    label: "🎨 Atmosphere", 
    categories: ALL_CATEGORIES.filter(c => c.group === "atmosphere")
  },
  { 
    id: "polish", 
    label: "✨ Polish", 
    categories: ALL_CATEGORIES.filter(c => c.group === "polish")
  },
] as const;

export type CategoryId = typeof ALL_CATEGORIES[number]['id'];
export type CoreCategoryId = typeof CORE_CATEGORIES[number]['id'];
export type CategoryGroupId = typeof CATEGORY_GROUPS[number]['id'];

interface CategoryTabsProps {
  value: CategoryId;
  onChange: (value: CategoryId) => void;
}

export default function CategoryTabs({ value, onChange }: CategoryTabsProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as CategoryId)} className="w-full">
      <TabsList className="w-full justify-start h-auto flex-wrap gap-2 bg-transparent p-0">
        {CORE_CATEGORIES.map((category) => {
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
