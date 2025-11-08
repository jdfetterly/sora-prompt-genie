import { useState } from 'react';
import PromptEditor from '../PromptEditor';

export default function PromptEditorExample() {
  const [value, setValue] = useState("A serene beach at sunset");
  
  return (
    <div className="p-8 max-w-2xl">
      <PromptEditor value={value} onChange={setValue} />
    </div>
  );
}
