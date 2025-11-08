import { useState } from 'react';
import CategoryTabs, { type CategoryId } from '../CategoryTabs';

export default function CategoryTabsExample() {
  const [category, setCategory] = useState<CategoryId>("camera-angles");
  
  return (
    <div className="p-8">
      <CategoryTabs value={category} onChange={setCategory} />
      <p className="mt-4 text-sm text-muted-foreground">Selected: {category}</p>
    </div>
  );
}
