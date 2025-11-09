import { useState } from 'react';
import Header from '../Header';

export default function HeroExample() {
  const [mode, setMode] = useState<'simple' | 'advanced'>('simple');
  return <Header mode={mode} onModeChange={setMode} />;
}
