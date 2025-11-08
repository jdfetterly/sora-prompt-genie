import { useState } from 'react';
import EnhancementGrid from '../EnhancementGrid';
import type { Enhancement } from '../EnhancementCard';

export default function EnhancementGridExample() {
  const [applied, setApplied] = useState<Set<string>>(new Set());
  
  const enhancements: Enhancement[] = [
    { id: '1', title: 'Wide Shot', description: 'Captures full scene', category: 'camera' },
    { id: '2', title: 'Close-Up', description: 'Tight on subject', category: 'camera' },
    { id: '3', title: 'Dutch Angle', description: 'Tilted perspective', category: 'camera' },
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
  
  return (
    <div className="p-8">
      <EnhancementGrid
        enhancements={enhancements}
        appliedIds={applied}
        onEnhancementClick={handleClick}
        onRefresh={() => console.log('Refresh')}
        categoryLabel="Camera Angles"
      />
    </div>
  );
}
