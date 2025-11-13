import { useState } from 'react';
import EnhancementGrid from '../EnhancementGrid';
import type { Enhancement } from '../EnhancementCard';
import type { CategoryId } from '../CategoryTabs';

export default function EnhancementGridExample() {
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const enhancements: Enhancement[] = [
    { id: '1', title: 'Wide Shot', description: 'Captures full scene', category: 'camera-angles' as CategoryId },
    { id: '2', title: 'Close-Up', description: 'Tight on subject', category: 'camera-angles' as CategoryId },
    { id: '3', title: 'Dutch Angle', description: 'Tilted perspective', category: 'camera-angles' as CategoryId },
  ];
  
  const handleClick = (enhancement: Enhancement) => {
    const newApplied = new Set(applied);
    if (newApplied.has(enhancement.id)) {
      newApplied.delete(enhancement.id);
    } else {
      newApplied.add(enhancement.id);
    }
    setApplied(newApplied);
  };
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
    console.log('Refresh');
  };
  
  return (
    <div className="p-8">
      <EnhancementGrid
        enhancements={enhancements}
        appliedIds={applied}
        onEnhancementClick={handleClick}
        onRefresh={handleRefresh}
        categoryLabel="Camera Angles"
        isRefreshing={isRefreshing}
      />
    </div>
  );
}
