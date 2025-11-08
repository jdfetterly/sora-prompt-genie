import { useState, useCallback } from "react";
import Hero from "@/components/Hero";
import PromptEditor from "@/components/PromptEditor";
import ActionBar from "@/components/ActionBar";
import CategoryTabs, { CATEGORIES, type CategoryId } from "@/components/CategoryTabs";
import EnhancementGrid from "@/components/EnhancementGrid";
import StarterPrompts from "@/components/StarterPrompts";
import { ENHANCEMENTS } from "@/lib/enhancements";
import type { Enhancement } from "@/components/EnhancementCard";
import { Card } from "@/components/ui/card";

interface PromptHistoryEntry {
  prompt: string;
  timestamp: number;
}

export default function Home() {
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [history, setHistory] = useState<PromptHistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [appliedEnhancements, setAppliedEnhancements] = useState<Set<string>>(new Set());
  const [currentCategory, setCurrentCategory] = useState<CategoryId>("camera-angles");

  const addToHistory = useCallback((prompt: string) => {
    const newEntry: PromptHistoryEntry = {
      prompt,
      timestamp: Date.now(),
    };
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newEntry);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const handleEnhancementClick = (enhancement: Enhancement) => {
    console.log('Enhancement clicked:', enhancement.title);
    
    const newApplied = new Set(appliedEnhancements);
    if (newApplied.has(enhancement.id)) {
      newApplied.delete(enhancement.id);
      setAppliedEnhancements(newApplied);
      return;
    }
    
    newApplied.add(enhancement.id);
    setAppliedEnhancements(newApplied);
    
    let enhancedPrompt = currentPrompt;
    if (!enhancedPrompt) {
      enhancedPrompt = enhancement.description;
    } else {
      enhancedPrompt = `${currentPrompt}. ${enhancement.title}: ${enhancement.description}`;
    }
    
    addToHistory(enhancedPrompt);
    setCurrentPrompt(enhancedPrompt);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentPrompt(history[newIndex].prompt);
    } else if (historyIndex === 0) {
      setHistoryIndex(-1);
      setCurrentPrompt("");
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentPrompt(history[newIndex].prompt);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentPrompt);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleRefresh = () => {
    console.log('Refresh suggestions for', currentCategory);
  };

  const handleStarterPromptSelect = (prompt: string) => {
    addToHistory(prompt);
    setCurrentPrompt(prompt);
  };

  const handlePromptChange = (value: string) => {
    setCurrentPrompt(value);
    if (value && value !== (history[historyIndex]?.prompt || "")) {
      addToHistory(value);
    }
  };

  const currentCategoryLabel = CATEGORIES.find(c => c.id === currentCategory)?.label || "";
  const currentEnhancements = ENHANCEMENTS[currentCategory] || [];

  return (
    <div className="min-h-screen bg-background">
      <Hero />
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Prompt Editor</h2>
                <StarterPrompts onSelect={handleStarterPromptSelect} />
              </div>
              
              <PromptEditor
                value={currentPrompt}
                onChange={handlePromptChange}
                placeholder="Describe your video scene... (e.g., 'A serene beach at sunset with gentle waves')"
              />
              
              <ActionBar
                onUndo={handleUndo}
                onRedo={handleRedo}
                onCopy={handleCopy}
                canUndo={historyIndex >= 0}
                canRedo={historyIndex < history.length - 1}
              />
            </Card>
            
            {history.length > 0 && (
              <Card className="p-4">
                <h3 className="text-sm font-medium mb-3">History</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {history.map((entry, index) => (
                    <button
                      key={entry.timestamp}
                      onClick={() => {
                        setHistoryIndex(index);
                        setCurrentPrompt(entry.prompt);
                      }}
                      className={`w-full text-left p-2 rounded text-xs hover-elevate transition-colors ${
                        index === historyIndex ? 'bg-primary/10' : ''
                      }`}
                      data-testid={`history-item-${index}`}
                    >
                      <div className="line-clamp-2 font-mono">{entry.prompt}</div>
                    </button>
                  ))}
                </div>
              </Card>
            )}
          </div>
          
          <div className="lg:col-span-3 space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Enhancement Options</h2>
              <CategoryTabs value={currentCategory} onChange={setCurrentCategory} />
            </div>
            
            <EnhancementGrid
              enhancements={currentEnhancements}
              appliedIds={appliedEnhancements}
              onEnhancementClick={handleEnhancementClick}
              onRefresh={handleRefresh}
              categoryLabel={currentCategoryLabel}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
