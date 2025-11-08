import { useState } from 'react';
import EnhancementCard from '../EnhancementCard';

export default function EnhancementCardExample() {
  const [applied, setApplied] = useState(false);
  
  const enhancement = {
    id: '1',
    title: 'Wide Establishing Shot',
    description: 'Eye-level wide angle capturing the full scene context',
    category: 'Camera Angles'
  };
  
  return (
    <div className="p-8 max-w-sm">
      <EnhancementCard
        enhancement={enhancement}
        isApplied={applied}
        onClick={() => setApplied(!applied)}
      />
    </div>
  );
}
