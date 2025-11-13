import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import Header from "@/components/Header";
import PromptEditor from "@/components/PromptEditor";
import ActionBar from "@/components/ActionBar";
import CategoryTabs, { CORE_CATEGORIES, type CategoryId } from "@/components/CategoryTabs";
import EnhancementGrid from "@/components/EnhancementGrid";
import AutoGenerateButton from "@/components/AutoGenerateButton";
import { type Mode } from "@/components/ModeToggle";
import PresetSelector from "@/components/PresetSelector";
import AdvancedCategoryGroups from "@/components/AdvancedCategoryGroups";
import AppliedFilters from "@/components/AppliedFilters";
import Footer from "@/components/Footer";
import { ENHANCEMENTS, type Preset } from "@/lib/enhancements";
import type { Enhancement } from "@/components/EnhancementCard";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { 
  EnhancePromptRequest, 
  EnhancePromptResponse, 
  GenerateSuggestionsRequest, 
  GenerateSuggestionsResponse,
  AutoGeneratePromptRequest,
  AutoGeneratePromptResponse,
  StructurePromptRequest,
  StructurePromptResponse 
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
  const [customSuggestions, setCustomSuggestions] = useState<Partial<Record<CategoryId, Enhancement[]>>>({});
  const [mode, setMode] = useState<Mode>("simple");
  const [refreshingCategories, setRefreshingCategories] = useState<Set<CategoryId>>(new Set());
  // Track the prompt state before each category's enhancement was applied
  const [promptBeforeCategory, setPromptBeforeCategory] = useState<Partial<Record<CategoryId, string>>>({});
  // Track which enhancement is currently being processed
  const [processingEnhancementId, setProcessingEnhancementId] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Refs for debounced history tracking
  const pendingHistorySave = useRef<NodeJS.Timeout | null>(null);
  const isAIUpdate = useRef(false);

  const enhanceMutation = useMutation({
    mutationFn: async (request: EnhancePromptRequest) => {
      return await apiRequest<EnhancePromptResponse>("/api/enhance-prompt", {
        method: "POST",
        body: JSON.stringify(request),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      setProcessingEnhancementId(null);
    },
    onError: (error) => {
      setProcessingEnhancementId(null);
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
      // Note: Refresh operations intentionally do not show success toasts.
      // Only error toasts are displayed. The visual feedback (refresh button state and new suggestions) is sufficient.
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
      isAIUpdate.current = true;
      addToHistory(data.generatedPrompt);
      setCurrentPrompt(data.generatedPrompt);
      // Note: Auto-generate intentionally does not show success toasts.
      // Only error toasts are displayed. The prompt update provides sufficient feedback.
    },
    onError: (error) => {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to auto-generate prompt",
        variant: "destructive",
      });
    },
  });

  const structureMutation = useMutation({
    mutationFn: async (request: StructurePromptRequest) => {
      return await apiRequest<StructurePromptResponse>("/api/structure-prompt", {
        method: "POST",
        body: JSON.stringify(request),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: (data) => {
      isAIUpdate.current = true;
      addToHistory(data.structuredPrompt);
      setCurrentPrompt(data.structuredPrompt);
      // Note: Structure operations intentionally do not show success toasts.
      // Only error toasts are displayed. The prompt update provides sufficient feedback.
    },
    onError: (error) => {
      toast({
        title: "Structuring failed",
        description: error instanceof Error ? error.message : "Failed to structure prompt",
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

  // Note: Filter applications (individual enhancements) intentionally do not show success toasts.
  // Only error toasts are displayed. The visual feedback (checkmark on applied cards) is sufficient.
  const handleEnhancementClick = async (enhancement: Enhancement) => {
    const newApplied = new Set(appliedEnhancements);
    
    // If clicking an already applied enhancement, remove it
    if (newApplied.has(enhancement.id)) {
      newApplied.delete(enhancement.id);
      setAppliedEnhancements(newApplied);
      
      // Restore prompt to state before this category's enhancement was applied
      const categoryKey = enhancement.category as CategoryId;
      if (promptBeforeCategory[categoryKey] !== undefined) {
        const restoredPrompt = promptBeforeCategory[categoryKey];
        isAIUpdate.current = true;
        addToHistory(restoredPrompt);
        setCurrentPrompt(restoredPrompt);
        // Clear the tracking for this category since no enhancement is applied
        setPromptBeforeCategory(prev => {
          const updated = { ...prev };
          delete updated[categoryKey];
          return updated;
        });
      }
      return;
    }
    
    // Check if there's already an enhancement from the same category
    const categoryKey = enhancement.category as CategoryId;
    const categoryEnhancements = customSuggestions[categoryKey] || ENHANCEMENTS[categoryKey] || [];
    const existingEnhancementId = Array.from(newApplied).find(id => {
      // Check if this ID belongs to an enhancement from the same category
      return categoryEnhancements.some(e => e.id === id);
    });
    
    // If there's an existing enhancement from the same category, remove it
    if (existingEnhancementId) {
      newApplied.delete(existingEnhancementId);
    }
    
    // Add the new enhancement
    newApplied.add(enhancement.id);
    setAppliedEnhancements(newApplied);
    
    // Determine the base prompt: if replacing, use the prompt before the previous enhancement
    // Otherwise, use the current prompt
    const basePrompt = existingEnhancementId && promptBeforeCategory[categoryKey] !== undefined
      ? promptBeforeCategory[categoryKey]
      : currentPrompt;
    
    // Store the prompt state before applying this category's enhancement (if not already stored)
    if (!promptBeforeCategory[categoryKey]) {
      setPromptBeforeCategory(prev => ({
        ...prev,
        [categoryKey]: currentPrompt,
      }));
    }
    
    const request: EnhancePromptRequest = {
      currentPrompt: basePrompt,
      enhancement: {
        title: enhancement.title,
        description: enhancement.description,
        category: enhancement.category,
      },
    };
    
    setProcessingEnhancementId(enhancement.id);
    const result = await enhanceMutation.mutateAsync(request);
    isAIUpdate.current = true;
    addToHistory(result.enhancedPrompt);
    setCurrentPrompt(result.enhancedPrompt);
    
    // Update the prompt before this category for future replacements
    // Only update if we're replacing (not if it's the first time)
    if (existingEnhancementId) {
      setPromptBeforeCategory(prev => ({
        ...prev,
        [enhancement.category]: basePrompt,
      }));
    }
  };

  const handleUndo = () => {
    // Clear any pending debounced save
    if (pendingHistorySave.current) {
      clearTimeout(pendingHistorySave.current);
      pendingHistorySave.current = null;
    }
    
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      isAIUpdate.current = true;
      setCurrentPrompt(history[newIndex].prompt);
    } else if (historyIndex === 0) {
      setHistoryIndex(-1);
      isAIUpdate.current = true;
      setCurrentPrompt("");
    }
  };

  const handleRedo = () => {
    // Clear any pending debounced save
    if (pendingHistorySave.current) {
      clearTimeout(pendingHistorySave.current);
      pendingHistorySave.current = null;
    }
    
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      isAIUpdate.current = true;
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

  const handleStructure = () => {
    if (!currentPrompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter a prompt before structuring it",
        variant: "destructive",
      });
      return;
    }
    
    structureMutation.mutate({
      currentPrompt: currentPrompt.trim(),
    });
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
    
    // Clear the prompt tracking for this category
    setPromptBeforeCategory(prev => {
      const updated = { ...prev };
      delete updated[targetCategory];
      return updated;
    });
    
    generateSuggestionsMutation.mutate({
      category: targetCategory,
      count: 8,
      currentPrompt: currentPrompt,
    });
  };

  const handlePresetSelect = async (preset: Preset) => {
    let updatedPrompt = currentPrompt;
    const presetEnhancementIds: string[] = [];
    const newApplied = new Set(appliedEnhancements);
    
    // Remove any existing enhancements from categories that the preset will apply to
    const presetCategories = new Set(preset.enhancements.map(e => e.category));
    
    presetCategories.forEach(category => {
      const categoryEnhancements = customSuggestions[category] || ENHANCEMENTS[category] || [];
      Array.from(newApplied).forEach(id => {
        if (categoryEnhancements.some(e => e.id === id)) {
          newApplied.delete(id);
        }
      });
    });
    
    // Apply each enhancement from the preset
    for (let i = 0; i < preset.enhancements.length; i++) {
      const enhancement = preset.enhancements[i];
      const enhancementId = `preset-${preset.id}-${i}`;
      presetEnhancementIds.push(enhancementId);
      
      // Determine base prompt: use the prompt before this category's enhancement if replacing
      const categoryKey = enhancement.category as CategoryId;
      const basePrompt = promptBeforeCategory[categoryKey] !== undefined
        ? promptBeforeCategory[categoryKey]!
        : updatedPrompt;
      
      // Store the prompt state before applying this category's enhancement (if not already stored)
      if (!promptBeforeCategory[categoryKey]) {
        setPromptBeforeCategory(prev => ({
          ...prev,
          [categoryKey]: updatedPrompt,
        }));
      }
      
      const request: EnhancePromptRequest = {
        currentPrompt: basePrompt,
        enhancement: {
          title: enhancement.title,
          description: enhancement.description,
          category: enhancement.category,
        },
      };
      
      try {
        const result = await enhanceMutation.mutateAsync(request);
        updatedPrompt = result.enhancedPrompt;
        
        // Update tracking for this category
        setPromptBeforeCategory(prev => ({
          ...prev,
          [enhancement.category]: basePrompt,
        }));
      } catch (error) {
        console.error("Failed to apply preset enhancement:", error);
        break;
      }
    }
    
    if (updatedPrompt !== currentPrompt) {
      // Mark preset enhancements as applied
      presetEnhancementIds.forEach(id => newApplied.add(id));
      setAppliedEnhancements(newApplied);
      
      isAIUpdate.current = true;
      addToHistory(updatedPrompt);
      setCurrentPrompt(updatedPrompt);
      // Note: Preset applications intentionally do not show success toasts.
      // Only error toasts are displayed. The prompt update provides sufficient feedback.
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
    
    // Clear any pending debounced save
    if (pendingHistorySave.current) {
      clearTimeout(pendingHistorySave.current);
      pendingHistorySave.current = null;
    }
    
    // Only debounce manual typing, not AI updates
    if (!isAIUpdate.current) {
      // Set up debounced history save (3 seconds)
      pendingHistorySave.current = setTimeout(() => {
        if (value && value !== (history[historyIndex]?.prompt || "")) {
          addToHistory(value);
        }
        pendingHistorySave.current = null;
      }, 3000);
    } else {
      // Reset the flag after AI update
      isAIUpdate.current = false;
    }
  };

  // Cleanup effect to clear pending timeout on unmount
  useEffect(() => {
    return () => {
      if (pendingHistorySave.current) {
        clearTimeout(pendingHistorySave.current);
      }
    };
  }, []);

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
      <Header mode={mode} onModeChange={setMode} />
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-8">
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
                placeholder="Enter at least 3 words, then click Enhance Prompt to create a detailed prompt..."
                isEnhancing={enhanceMutation.isPending || structureMutation.isPending || autoGenerateMutation.isPending}
              />
              
              <ActionBar
                onUndo={handleUndo}
                onRedo={handleRedo}
                onCopy={handleCopy}
                onStructure={handleStructure}
                canUndo={historyIndex >= 0}
                canRedo={historyIndex < history.length - 1}
                isStructuring={structureMutation.isPending}
              />
            </Card>
            
            <PresetSelector 
              onPresetSelect={handlePresetSelect}
              disabled={enhanceMutation.isPending}
            />
            
            {history.length > 0 && (
              <Card className="p-0">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="history" className="border-none">
                    <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:no-underline">
                      History
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {history.map((entry, index) => (
                          <button
                            key={entry.timestamp}
                            onClick={() => {
                              // Clear any pending debounced save
                              if (pendingHistorySave.current) {
                                clearTimeout(pendingHistorySave.current);
                                pendingHistorySave.current = null;
                              }
                              setHistoryIndex(index);
                              isAIUpdate.current = true;
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
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </Card>
            )}
          </div>
          
          <div className="lg:col-span-3 space-y-6">
            <h2 className="text-lg font-semibold">Enhancement Options</h2>
            
            <AppliedFilters
              appliedIds={appliedEnhancements}
              enhancements={ENHANCEMENTS}
              customSuggestions={customSuggestions}
              onRemove={handleEnhancementClick}
            />

            {mode === "simple" ? (
              <>
                <div className="space-y-4">
                  <CategoryTabs value={currentCategory} onChange={setCurrentCategory} />
                  <EnhancementGrid
                    enhancements={currentEnhancements}
                    appliedIds={appliedEnhancements}
                    onEnhancementClick={handleEnhancementClick}
                    onRefresh={() => handleRefresh()}
                    categoryLabel={currentCategoryLabel}
                    isRefreshing={refreshingCategories.has(currentCategory)}
                    processingEnhancementId={processingEnhancementId}
                  />
                </div>
              </>
            ) : (
              <AdvancedCategoryGroups
                enhancements={ENHANCEMENTS}
                customSuggestions={customSuggestions}
                appliedIds={appliedEnhancements}
                onEnhancementClick={handleEnhancementClick}
                onRefresh={handleRefresh}
                isRefreshing={refreshingState}
                processingEnhancementId={processingEnhancementId}
              />
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
