import { useState, useCallback, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import Hero from "@/components/Hero";
import PromptEditor from "@/components/PromptEditor";
import ActionBar from "@/components/ActionBar";
import CategoryTabs, { CORE_CATEGORIES, type CategoryId } from "@/components/CategoryTabs";
import EnhancementGrid from "@/components/EnhancementGrid";
import AutoGenerateButton from "@/components/AutoGenerateButton";
import ModeToggle, { type Mode } from "@/components/ModeToggle";
import PresetSelector from "@/components/PresetSelector";
import AdvancedCategoryGroups from "@/components/AdvancedCategoryGroups";
import { ENHANCEMENTS, type Preset } from "@/lib/enhancements";
import type { Enhancement } from "@/components/EnhancementCard";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { 
  EnhancePromptRequest, 
  EnhancePromptResponse, 
  GenerateSuggestionsRequest, 
  GenerateSuggestionsResponse,
  AutoGeneratePromptRequest,
  AutoGeneratePromptResponse 
} from "@shared/schema";

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
  const [customSuggestions, setCustomSuggestions] = useState<Record<string, Enhancement[]>>({});
  const [mode, setMode] = useState<Mode>("simple");
  const [refreshingCategories, setRefreshingCategories] = useState<Set<CategoryId>>(new Set());
  const { toast } = useToast();

  const enhanceMutation = useMutation({
    mutationFn: async (request: EnhancePromptRequest) => {
      return await apiRequest<EnhancePromptResponse>("/api/enhance-prompt", {
        method: "POST",
        body: JSON.stringify(request),
        headers: { "Content-Type": "application/json" },
      });
    },
    onError: (error) => {
      toast({
        title: "Enhancement failed",
        description: error instanceof Error ? error.message : "Failed to enhance prompt with AI",
        variant: "destructive",
      });
    },
  });

  const generateSuggestionsMutation = useMutation({
    mutationFn: async (request: GenerateSuggestionsRequest & { category: CategoryId }) => {
      setRefreshingCategories(prev => new Set(prev).add(request.category));
      return await apiRequest<GenerateSuggestionsResponse>("/api/generate-suggestions", {
        method: "POST",
        body: JSON.stringify(request),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: (data, variables) => {
      setCustomSuggestions(prev => ({
        ...prev,
        [variables.category]: data.suggestions,
      }));
      setRefreshingCategories(prev => {
        const next = new Set(prev);
        next.delete(variables.category);
        return next;
      });
      toast({
        title: "Suggestions refreshed",
        description: "New AI-generated suggestions are ready",
      });
    },
    onError: (error, variables) => {
      setRefreshingCategories(prev => {
        const next = new Set(prev);
        next.delete(variables.category);
        return next;
      });
      toast({
        title: "Failed to generate suggestions",
        description: error instanceof Error ? error.message : "Could not generate new suggestions",
        variant: "destructive",
      });
    },
  });

  const autoGenerateMutation = useMutation({
    mutationFn: async (request: AutoGeneratePromptRequest) => {
      return await apiRequest<AutoGeneratePromptResponse>("/api/auto-generate-prompt", {
        method: "POST",
        body: JSON.stringify(request),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: (data) => {
      addToHistory(data.generatedPrompt);
      setCurrentPrompt(data.generatedPrompt);
      toast({
        title: "Prompt generated",
        description: "Your basic idea has been expanded into a cinematic prompt",
      });
    },
    onError: (error) => {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to auto-generate prompt",
        variant: "destructive",
      });
    },
  });

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

  const handleEnhancementClick = async (enhancement: Enhancement) => {
    const newApplied = new Set(appliedEnhancements);
    if (newApplied.has(enhancement.id)) {
      newApplied.delete(enhancement.id);
      setAppliedEnhancements(newApplied);
      return;
    }
    
    newApplied.add(enhancement.id);
    setAppliedEnhancements(newApplied);
    
    const request: EnhancePromptRequest = {
      currentPrompt,
      enhancement: {
        title: enhancement.title,
        description: enhancement.description,
        category: enhancement.category,
      },
    };
    
    const result = await enhanceMutation.mutateAsync(request);
    addToHistory(result.enhancedPrompt);
    setCurrentPrompt(result.enhancedPrompt);
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

  const handleRefresh = (category?: CategoryId) => {
    const targetCategory = category || currentCategory;
    const currentEnhancements = customSuggestions[targetCategory] || ENHANCEMENTS[targetCategory] || [];
    
    // Clear applied enhancements for this category when refreshing
    const newApplied = new Set(appliedEnhancements);
    Array.from(newApplied).forEach(id => {
      if (id.startsWith(`ai-${targetCategory}-`) || currentEnhancements.some(e => e.id === id)) {
        newApplied.delete(id);
      }
    });
    setAppliedEnhancements(newApplied);
    
    generateSuggestionsMutation.mutate({
      category: targetCategory,
      count: 8,
      currentPrompt: currentPrompt,
    });
  };

  const handlePresetSelect = async (preset: Preset) => {
    let updatedPrompt = currentPrompt;
    const presetEnhancementIds: string[] = [];
    
    for (let i = 0; i < preset.enhancements.length; i++) {
      const enhancement = preset.enhancements[i];
      const enhancementId = `preset-${preset.id}-${i}`;
      presetEnhancementIds.push(enhancementId);
      
      const request: EnhancePromptRequest = {
        currentPrompt: updatedPrompt,
        enhancement: {
          title: enhancement.title,
          description: enhancement.description,
          category: enhancement.category,
        },
      };
      
      try {
        const result = await enhanceMutation.mutateAsync(request);
        updatedPrompt = result.enhancedPrompt;
      } catch (error) {
        console.error("Failed to apply preset enhancement:", error);
        break;
      }
    }
    
    if (updatedPrompt !== currentPrompt) {
      // Mark preset enhancements as applied
      const newApplied = new Set(appliedEnhancements);
      presetEnhancementIds.forEach(id => newApplied.add(id));
      setAppliedEnhancements(newApplied);
      
      addToHistory(updatedPrompt);
      setCurrentPrompt(updatedPrompt);
      toast({
        title: "Preset applied",
        description: `${preset.name} style added to your prompt`,
      });
    }
  };

  const handleAutoGenerate = () => {
    if (!currentPrompt.trim()) return;
    
    autoGenerateMutation.mutate({
      basicPrompt: currentPrompt.trim(),
    });
  };

  const handlePromptChange = (value: string) => {
    setCurrentPrompt(value);
    if (value && value !== (history[historyIndex]?.prompt || "")) {
      addToHistory(value);
    }
  };

  const wordCount = useMemo(() => {
    return currentPrompt.trim().split(/\s+/).filter(word => word.length > 0).length;
  }, [currentPrompt]);

  const currentCategoryLabel = CORE_CATEGORIES.find(c => c.id === currentCategory)?.label || "";
  const currentEnhancements = customSuggestions[currentCategory] || ENHANCEMENTS[currentCategory] || [];
  
  // Create refreshing state map for advanced mode
  const refreshingState = Object.fromEntries(
    Array.from(refreshingCategories).map(cat => [cat, true])
  ) as Record<CategoryId, boolean>;

  return (
    <div className="min-h-screen bg-background">
      <Hero />
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Prompt Editor</h2>
                <AutoGenerateButton 
                  onClick={handleAutoGenerate}
                  disabled={enhanceMutation.isPending}
                  isGenerating={autoGenerateMutation.isPending}
                  wordCount={wordCount}
                />
              </div>
              
              <PromptEditor
                value={currentPrompt}
                onChange={handlePromptChange}
                placeholder="Enter at least 3 words, then click Auto-Generate to create a detailed prompt..."
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
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Enhancement Options</h2>
              <ModeToggle mode={mode} onChange={setMode} />
            </div>

            {mode === "simple" ? (
              <>
                <PresetSelector 
                  onPresetSelect={handlePresetSelect}
                  disabled={enhanceMutation.isPending}
                />
                
                <div className="space-y-4">
                  <CategoryTabs value={currentCategory} onChange={setCurrentCategory} />
                  <EnhancementGrid
                    enhancements={currentEnhancements}
                    appliedIds={appliedEnhancements}
                    onEnhancementClick={handleEnhancementClick}
                    onRefresh={() => handleRefresh()}
                    categoryLabel={currentCategoryLabel}
                    isRefreshing={refreshingCategories.has(currentCategory)}
                  />
                </div>
              </>
            ) : (
              <AdvancedCategoryGroups
                enhancements={ENHANCEMENTS}
                appliedIds={appliedEnhancements}
                onEnhancementClick={handleEnhancementClick}
                onRefresh={handleRefresh}
                isRefreshing={refreshingState}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
