import React, { useState, useCallback, useEffect } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { OutputDisplay } from './components/OutputDisplay';
import { LibraryModal } from './components/LibraryModal';
import { DialogueModal } from './components/DialogueModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { VisualPromptModal } from './components/VisualPromptModal';
import { AllVisualPromptsModal } from './components/AllVisualPromptsModal';
import { VideoGeneratorTab } from './components/VideoGeneratorTab';
import { generateScript, generateScriptOutline, generateTopicSuggestions, reviseScript, generateScriptPart, extractDialogue, generateKeywordSuggestions, validateApiKey, generateVisualPrompt, generateAllVisualPrompts, generateVideoPlan, suggestStyleOptions } from './services/geminiService';
import type { StyleOptions, FormattingOptions, LibraryItem, GenerationParams, VisualPrompt, AllVisualPromptsResult, VideoPlan, ScriptType, NumberOfSpeakers, CachedData } from './types';
import { TONE_OPTIONS, STYLE_OPTIONS, VOICE_OPTIONS, LANGUAGE_OPTIONS } from './constants';
import { BookOpenIcon } from './components/icons/BookOpenIcon';

type ActiveTab = 'script' | 'video';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('script');

  const [topic, setTopic] = useState<string>('');
  const [targetAudience, setTargetAudience] = useState<string>(LANGUAGE_OPTIONS[0].value);
  const [styleOptions, setStyleOptions] = useState<StyleOptions>({
    tone: TONE_OPTIONS[2].value,
    style: STYLE_OPTIONS[0].value,
    voice: VOICE_OPTIONS[1].value,
  });
  const [keywords, setKeywords] = useState<string>('');
  const [formattingOptions, setFormattingOptions] = useState<FormattingOptions>({
    headings: true,
    bullets: true,
    bold: true,
    includeIntro: true,
    includeOutro: true,
  });
  const [wordCount, setWordCount] = useState<string>('800');
  const [scriptParts, setScriptParts] = useState<string>('Auto');
  const [scriptType, setScriptType] = useState<ScriptType>('Video');
  const [numberOfSpeakers, setNumberOfSpeakers] = useState<NumberOfSpeakers>('Auto');

  const [generatedScript, setGeneratedScript] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [topicSuggestions, setTopicSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

  const [keywordSuggestions, setKeywordSuggestions] = useState<string[]>([]);
  const [isSuggestingKeywords, setIsSuggestingKeywords] = useState<boolean>(false);
  const [keywordSuggestionError, setKeywordSuggestionError] = useState<string | null>(null);

  const [isSuggestingStyle, setIsSuggestingStyle] = useState<boolean>(false);
  const [styleSuggestionError, setStyleSuggestionError] = useState<string | null>(null);

  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [isLibraryOpen, setIsLibraryOpen] = useState<boolean>(false);

  const [revisionPrompt, setRevisionPrompt] = useState<string>('');
  const [revisionCount, setRevisionCount] = useState<number>(0);

  const [isGeneratingSequentially, setIsGeneratingSequentially] = useState<boolean>(false);
  const [outlineParts, setOutlineParts] = useState<string[]>([]);
  const [currentPartIndex, setCurrentPartIndex] = useState<number>(0);

  const [isDialogueModalOpen, setIsDialogueModalOpen] = useState<boolean>(false);
  const [extractedDialogue, setExtractedDialogue] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [apiKeys, setApiKeys] = useState<string[]>([]);

  const [isVisualPromptModalOpen, setIsVisualPromptModalOpen] = useState<boolean>(false);
  const [visualPrompt, setVisualPrompt] = useState<VisualPrompt | null>(null);
  const [isGeneratingVisualPrompt, setIsGeneratingVisualPrompt] = useState<boolean>(false);
  const [visualPromptError, setVisualPromptError] = useState<string | null>(null);

  const [isAllVisualPromptsModalOpen, setIsAllVisualPromptsModalOpen] = useState<boolean>(false);
  const [allVisualPrompts, setAllVisualPrompts] = useState<AllVisualPromptsResult[] | null>(null);
  const [isGeneratingAllVisualPrompts, setIsGeneratingAllVisualPrompts] = useState<boolean>(false);
  const [allVisualPromptsError, setAllVisualPromptsError] = useState<string | null>(null);

  // Unified state for video plan generation
  const [videoPlanData, setVideoPlanData] = useState<VideoPlan | null>(null);
  const [isGeneratingVideoPlan, setIsGeneratingVideoPlan] = useState<boolean>(false);
  const [videoPlanError, setVideoPlanError] = useState<string | null>(null);


  // Caching states
  const [visualPromptsCache, setVisualPromptsCache] = useState<Map<string, VisualPrompt>>(new Map());
  const [allVisualPromptsCache, setAllVisualPromptsCache] = useState<AllVisualPromptsResult[] | null>(null);
  const [videoPlanCache, setVideoPlanCache] = useState<VideoPlan | null>(null);
  const [extractedDialogueCache, setExtractedDialogueCache] = useState<string | null>(null);

  // Action completion states
  const [hasExtractedDialogue, setHasExtractedDialogue] = useState<boolean>(false);
  const [hasGeneratedAllVisualPrompts, setHasGeneratedAllVisualPrompts] = useState<boolean>(false);
  const [hasSavedToLibrary, setHasSavedToLibrary] = useState<boolean>(false);


  useEffect(() => {
    try {
      const savedLibrary = localStorage.getItem('yt-script-library');
      if (savedLibrary) {
        setLibrary(JSON.parse(savedLibrary));
      }
      const savedApiKeys = localStorage.getItem('gemini-api-keys');
      if (savedApiKeys) {
        const parsedKeys = JSON.parse(savedApiKeys);
        if (Array.isArray(parsedKeys)) {
            setApiKeys(parsedKeys);
        }
      }
    } catch (e) {
      console.error("Failed to load data from localStorage", e);
    }
  }, []);
  
  const resetCachesAndStates = () => {
    setVisualPromptsCache(new Map());
    setAllVisualPromptsCache(null);
    setVideoPlanCache(null);
    setExtractedDialogueCache(null);
    setHasExtractedDialogue(false);
    setHasGeneratedAllVisualPrompts(false);
    setHasSavedToLibrary(false);
    setVideoPlanData(null);
  };


  const handleAddApiKeys = async (keysToAdd: string[]): Promise<{ successCount: number; errors: { key: string; message: string }[] }> => {
    let successCount = 0;
    const errors: { key: string; message: string }[] = [];
    const newKeys: string[] = [];
    const batchKeys = new Set<string>();

    for (const key of keysToAdd) {
        if (!key) continue;

        if (apiKeys.includes(key)) {
            errors.push({ key, message: 'Đã tồn tại.' });
            continue;
        }
        if (batchKeys.has(key)) {
            continue;
        }
        
        try {
            await validateApiKey(key);
            newKeys.push(key);
            batchKeys.add(key);
            successCount++;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Lỗi không xác định.';
            errors.push({ key, message });
        }
    }
    
    if (newKeys.length > 0) {
        const updatedKeys = [...newKeys, ...apiKeys];
        setApiKeys(updatedKeys);
        localStorage.setItem('gemini-api-keys', JSON.stringify(updatedKeys));
    }

    return { successCount, errors };
  };

  const handleDeleteApiKey = (keyToDelete: string) => {
    const updatedKeys = apiKeys.filter(k => k !== keyToDelete);
    setApiKeys(updatedKeys);
    localStorage.setItem('gemini-api-keys', JSON.stringify(updatedKeys));
  };

  const handleSaveToLibrary = useCallback(() => {
    if (!generatedScript.trim() || !topic.trim()) return;

    const cachedData: CachedData = {
        visualPrompts: Object.fromEntries(visualPromptsCache),
        allVisualPrompts: allVisualPromptsCache,
        videoPlan: videoPlanCache,
        extractedDialogue: extractedDialogueCache,
        hasExtractedDialogue,
        hasGeneratedAllVisualPrompts,
        hasSummarizedScript: !!videoPlanCache,
    };

    const newItem: LibraryItem = {
      id: Date.now(),
      topic: topic,
      script: generatedScript,
      cachedData: cachedData,
    };

    const updatedLibrary = [newItem, ...library];
    setLibrary(updatedLibrary);
    localStorage.setItem('yt-script-library', JSON.stringify(updatedLibrary));
    setHasSavedToLibrary(true);
  }, [
    generatedScript, topic, library, visualPromptsCache, allVisualPromptsCache, 
    videoPlanCache, extractedDialogueCache, hasExtractedDialogue, 
    hasGeneratedAllVisualPrompts
  ]);

  const handleDeleteScript = useCallback((id: number) => {
    const updatedLibrary = library.filter(item => item.id !== id);
    setLibrary(updatedLibrary);
    localStorage.setItem('yt-script-library', JSON.stringify(updatedLibrary));
  }, [library]);

  const handleLoadScript = useCallback((item: LibraryItem) => {
    resetCachesAndStates();
    setActiveTab('script');

    setTopic(item.topic);
    setGeneratedScript(item.script);

    if (item.cachedData) {
        setVisualPromptsCache(new Map(Object.entries(item.cachedData.visualPrompts || {})));
        setAllVisualPromptsCache(item.cachedData.allVisualPrompts);
        setVideoPlanCache(item.cachedData.videoPlan);
        setVideoPlanData(item.cachedData.videoPlan); // also populate video tab data
        setExtractedDialogueCache(item.cachedData.extractedDialogue);
        setHasExtractedDialogue(item.cachedData.hasExtractedDialogue);
        setHasGeneratedAllVisualPrompts(item.cachedData.hasGeneratedAllVisualPrompts);
    }
    
    setHasSavedToLibrary(true); // Since it's loaded from the library, it's considered saved.
    setIsLibraryOpen(false);
  }, []);
  
  const withApiKeyCheck = <T extends (...args: any[]) => Promise<void>>(fn: T) => {
    return async (...args: Parameters<T>) => {
      if (apiKeys.length === 0) {
        setIsApiKeyModalOpen(true);
        return;
      }
      return fn(...args);
    };
  };

  const handleGenerateSuggestions = useCallback(async () => {
    if (!topic.trim()) {
      setSuggestionError('Vui lòng nhập chủ đề chính để nhận gợi ý.');
      return;
    }
    setIsSuggesting(true);
    setSuggestionError(null);
    setTopicSuggestions([]);

    try {
      const suggestions = await generateTopicSuggestions(topic);
      setTopicSuggestions(suggestions);
    } catch (err) {
      setSuggestionError(err instanceof Error ? err.message : 'Lỗi không xác định khi tạo gợi ý.');
    } finally {
      setIsSuggesting(false);
    }
  }, [topic]);

  const handleGenerateKeywordSuggestions = useCallback(async () => {
    if (!topic.trim()) {
      setKeywordSuggestionError('Vui lòng nhập chủ đề chính để nhận gợi ý từ khóa.');
      return;
    }
    setIsSuggestingKeywords(true);
    setKeywordSuggestionError(null);
    setKeywordSuggestions([]);

    try {
      const suggestions = await generateKeywordSuggestions(topic);
      setKeywordSuggestions(suggestions);
    } catch (err) {
      setKeywordSuggestionError(err instanceof Error ? err.message : 'Lỗi không xác định khi tạo gợi ý từ khóa.');
    } finally {
      setIsSuggestingKeywords(false);
    }
  }, [topic]);

  const handleSuggestStyleOptions = useCallback(async () => {
    if (!topic.trim()) {
      setStyleSuggestionError('Vui lòng nhập chủ đề chính trước.');
      return;
    }
    setIsSuggestingStyle(true);
    setStyleSuggestionError(null);

    try {
      const suggestedOptions = await suggestStyleOptions(topic);
      setStyleOptions(suggestedOptions);
    } catch (err) {
      setStyleSuggestionError(err instanceof Error ? err.message : 'Lỗi không xác định khi tạo gợi ý phong cách.');
    } finally {
      setIsSuggestingStyle(false);
    }
  }, [topic]);

  const handleGenerateScript = useCallback(async () => {
    if (!topic.trim()) {
      setError('Vui lòng nhập hoặc chọn một chủ đề video cụ thể.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedScript('');
    setIsGeneratingSequentially(false);
    setRevisionCount(0);
    resetCachesAndStates();

    try {
      const isLongScript = parseInt(wordCount, 10) > 1000 && scriptType === 'Video';
      if (isLongScript) {
        const outline = await generateScriptOutline(topic, wordCount, targetAudience);
        setGeneratedScript(outline);
      } else {
        const script = await generateScript({ topic, targetAudience, styleOptions, keywords, formattingOptions, wordCount, scriptParts, scriptType, numberOfSpeakers });
        setGeneratedScript(script);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.');
    } finally {
      setIsLoading(false);
    }
  }, [topic, targetAudience, styleOptions, keywords, formattingOptions, wordCount, scriptParts, scriptType, numberOfSpeakers]);
  
  const handleReviseScript = useCallback(async () => {
    if (!revisionPrompt.trim() || !generatedScript.trim()) {
      setError('Vui lòng nhập yêu cầu sửa đổi.');
      return;
    }
    setIsLoading(true);
    setError(null);
    resetCachesAndStates();

    const params: GenerationParams = { topic, targetAudience, styleOptions, keywords, formattingOptions, wordCount, scriptParts, scriptType, numberOfSpeakers };

    try {
      const revisedScript = await reviseScript(generatedScript, revisionPrompt, params);
      setGeneratedScript(revisedScript);
      setRevisionCount(prev => prev + 1);
      setRevisionPrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định khi sửa kịch bản.');
    } finally {
      setIsLoading(false);
    }
  }, [revisionPrompt, generatedScript, topic, targetAudience, styleOptions, keywords, formattingOptions, wordCount, scriptParts, scriptType, numberOfSpeakers]);

  const handleGenerateNextPart = useCallback(async () => {
      if (!isGeneratingSequentially || currentPartIndex >= outlineParts.length) {
          setIsGeneratingSequentially(false);
          return;
      }
      setIsLoading(true);
      setError(null);
      try {
          const fullOutline = outlineParts.join('\n');
          const currentPartOutline = outlineParts[currentPartIndex];
          const params = { targetAudience, styleOptions, keywords, formattingOptions, wordCount, scriptParts, scriptType, numberOfSpeakers };
          const newPart = await generateScriptPart(fullOutline, generatedScript, currentPartOutline, params);
          
          setGeneratedScript(prev => (prev ? prev + '\n\n' : '') + newPart);
          
          const nextPartIndex = currentPartIndex + 1;
          setCurrentPartIndex(nextPartIndex);

          if (nextPartIndex >= outlineParts.length) {
              setIsGeneratingSequentially(false);
          }
      } catch (err) {
          setError(err instanceof Error ? err.message : 'Lỗi khi tạo phần tiếp theo.');
          setIsGeneratingSequentially(false);
      } finally {
          setIsLoading(false);
      }
  }, [currentPartIndex, outlineParts, isGeneratingSequentially, generatedScript, targetAudience, styleOptions, keywords, formattingOptions, wordCount, scriptParts, scriptType, numberOfSpeakers]);
  
  const handleStartSequentialGeneration = useCallback(() => {
    if (!generatedScript.trim() || !generatedScript.includes("### Dàn Ý Chi Tiết")) {
        setError('Không có dàn ý nào để xử lý.');
        return;
    }
    const outlineContent = generatedScript.split('---')[1]?.trim();
    if (!outlineContent) {
        setError('Dàn ý không hợp lệ.');
        return;
    }
    const parts = outlineContent.split(/\n(?=(?:#){2,}\s)/).filter(p => p.trim() !== '');
    setOutlineParts(parts);
    setCurrentPartIndex(0);
    setIsGeneratingSequentially(true);
    setGeneratedScript('');
    resetCachesAndStates();
  }, [generatedScript]);

  const handleExtractDialogue = useCallback(async () => {
    if (!generatedScript.trim()) return;

    if (extractedDialogueCache) {
      setExtractedDialogue(extractedDialogueCache);
      setIsDialogueModalOpen(true);
      return;
    }
    
    setIsExtracting(true);
    setExtractionError(null);
    setExtractedDialogue(null);
    setIsDialogueModalOpen(true);

    try {
        const dialogue = await extractDialogue(generatedScript, targetAudience);
        setExtractedDialogue(dialogue);
        setExtractedDialogueCache(dialogue);
        setHasExtractedDialogue(true);
    } catch(err) {
        setExtractionError(err instanceof Error ? err.message : 'Lỗi không xác định khi tách lời thoại.');
    } finally {
        setIsExtracting(false);
    }
  }, [generatedScript, targetAudience, extractedDialogueCache]);

  const handleGenerateVisualPrompt = useCallback(async (scene: string) => {
    if (visualPromptsCache.has(scene)) {
        setVisualPrompt(visualPromptsCache.get(scene)!);
        setIsVisualPromptModalOpen(true);
        return;
    }

    setIsGeneratingVisualPrompt(true);
    setVisualPrompt(null);
    setVisualPromptError(null);
    setIsVisualPromptModalOpen(true);

    try {
        const prompt = await generateVisualPrompt(scene);
        setVisualPrompt(prompt);
        setVisualPromptsCache(prevCache => new Map(prevCache).set(scene, prompt));
    } catch(err) {
        setVisualPromptError(err instanceof Error ? err.message : 'Lỗi không xác định khi tạo prompt.');
    } finally {
        setIsGeneratingVisualPrompt(false);
    }
  }, [visualPromptsCache]);
  
  const handleGenerateAllVisualPrompts = useCallback(async () => {
    if (!generatedScript.trim()) return;

    if (allVisualPromptsCache) {
        const mergedPrompts = allVisualPromptsCache.map(p => {
            const singleCached = visualPromptsCache.get(p.scene);
            if (singleCached) {
                return { ...p, ...singleCached };
            }
            return p;
        });
        setAllVisualPrompts(mergedPrompts);
        setIsAllVisualPromptsModalOpen(true);
        return;
    }

    setIsGeneratingAllVisualPrompts(true);
    setAllVisualPrompts(null);
    setAllVisualPromptsError(null);
    setIsAllVisualPromptsModalOpen(true);

    try {
        const promptsFromServer = await generateAllVisualPrompts(generatedScript);
        
        const finalPrompts = promptsFromServer.map(serverPrompt => {
            const cachedSinglePrompt = visualPromptsCache.get(serverPrompt.scene);
            if (cachedSinglePrompt) {
                return {
                    scene: serverPrompt.scene,
                    english: cachedSinglePrompt.english,
                    vietnamese: cachedSinglePrompt.vietnamese,
                };
            }
            return serverPrompt;
        });

        setAllVisualPrompts(finalPrompts);
        setAllVisualPromptsCache(finalPrompts);
        setHasGeneratedAllVisualPrompts(true);
    } catch(err) {
        setAllVisualPromptsError(err instanceof Error ? err.message : 'Lỗi không xác định khi tạo prompt hàng loạt.');
    } finally {
        setIsGeneratingAllVisualPrompts(false);
    }
  }, [generatedScript, allVisualPromptsCache, visualPromptsCache]);
  
  const handleGenerateVideoPlanFromScriptTab = useCallback(async () => {
    if (!generatedScript.trim()) return;
    
    if (videoPlanCache) {
        setVideoPlanData(videoPlanCache);
        setActiveTab('video');
        return;
    }

    setIsGeneratingVideoPlan(true);
    setVideoPlanData(null);
    setVideoPlanError(null);
    setActiveTab('video');
    
    try {
        const plan = await generateVideoPlan(generatedScript);
        setVideoPlanData(plan);
        setVideoPlanCache(plan);
    } catch(err) {
        setVideoPlanError(err instanceof Error ? err.message : 'Lỗi không xác định khi chuyển đổi kịch bản.');
    } finally {
        setIsGeneratingVideoPlan(false);
    }
  }, [generatedScript, videoPlanCache]);

  const handleGenerateVideoPlanFromCustomScript = useCallback(async (script: string) => {
    if (!script.trim()) {
        setVideoPlanError("Vui lòng dán kịch bản vào ô trống.");
        return;
    }

    setIsGeneratingVideoPlan(true);
    setVideoPlanData(null);
    setVideoPlanError(null);
    
    try {
        const plan = await generateVideoPlan(script);
        setVideoPlanData(plan);
        setVideoPlanCache(plan);
    } catch(err) {
        setVideoPlanError(err instanceof Error ? err.message : 'Lỗi không xác định khi tạo kế hoạch video.');
    } finally {
        setIsGeneratingVideoPlan(false);
    }
  }, []);

  const handleClearVideoPlan = useCallback(() => {
    setVideoPlanData(null);
    setVideoPlanCache(null);
    setVideoPlanError(null);
  }, []);

  useEffect(() => {
    if (isGeneratingSequentially && currentPartIndex === 0 && generatedScript === '' && outlineParts.length > 0) {
      handleGenerateNextPart();
    }
  }, [isGeneratingSequentially, currentPartIndex, generatedScript, outlineParts, handleGenerateNextPart]);

  return (
    <div className="min-h-screen bg-primary font-sans">
      <header className="bg-secondary/50 border-b border-secondary p-4 shadow-lg flex justify-between items-center">
        <div className="flex-1"></div>
        <div className="flex-1 text-center">
            <h1 className="text-2xl font-bold text-accent">
              Trợ lý Sáng tạo Kịch bản & Video
            </h1>
            <p className="text-text-secondary mt-1 text-sm md:text-base">
              Từ ý tưởng đến kịch bản và video hoàn chỉnh.
            </p>
        </div>
        <div className="flex-1 flex justify-end items-center gap-4">
            <button 
                onClick={() => setIsLibraryOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-primary text-text-primary font-semibold rounded-lg transition-colors"
                aria-label="Mở thư viện"
            >
                <BookOpenIcon className="w-5 h-5"/>
                <span className="hidden md:inline">Thư viện</span>
            </button>
            <button 
                onClick={() => setIsApiKeyModalOpen(true)}
                className="px-4 py-2 bg-secondary hover:bg-primary text-text-primary font-semibold rounded-lg transition-colors"
                aria-label="Cài đặt API Key"
            >
                API
            </button>
        </div>
      </header>

      <main className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="mb-6">
            <div className="flex border-b border-secondary">
                <button 
                    onClick={() => setActiveTab('script')}
                    className={`px-6 py-3 text-lg font-semibold transition-colors ${activeTab === 'script' ? 'text-accent border-b-2 border-accent' : 'text-text-secondary hover:text-text-primary'}`}
                >
                    Kịch bản
                </button>
                <button 
                    onClick={() => setActiveTab('video')}
                    className={`px-6 py-3 text-lg font-semibold transition-colors ${activeTab === 'video' ? 'text-accent border-b-2 border-accent' : 'text-text-secondary hover:text-text-primary'}`}
                >
                    Tạo Video
                </button>
            </div>
        </div>

        {activeTab === 'script' && (
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-2/5 lg:w-1/3 flex-shrink-0">
                <ControlPanel
                  topic={topic}
                  setTopic={setTopic}
                  onGenerateSuggestions={withApiKeyCheck(handleGenerateSuggestions)}
                  isSuggesting={isSuggesting}
                  suggestions={topicSuggestions}
                  suggestionError={suggestionError}
                  targetAudience={targetAudience}
                  setTargetAudience={setTargetAudience}
                  styleOptions={styleOptions}
                  setStyleOptions={setStyleOptions}
                  keywords={keywords}
                  setKeywords={setKeywords}
                  formattingOptions={formattingOptions}
                  setFormattingOptions={setFormattingOptions}
                  wordCount={wordCount}
                  setWordCount={setWordCount}
                  scriptParts={scriptParts}
                  setScriptParts={setScriptParts}
                  onGenerate={withApiKeyCheck(handleGenerateScript)}
                  isLoading={isLoading || isSuggesting || isSuggestingKeywords || isSuggestingStyle}
                  onGenerateKeywordSuggestions={withApiKeyCheck(handleGenerateKeywordSuggestions)}
                  isSuggestingKeywords={isSuggestingKeywords}
                  keywordSuggestions={keywordSuggestions}
                  keywordSuggestionError={keywordSuggestionError}
                  scriptType={scriptType}
                  setScriptType={setScriptType}
                  numberOfSpeakers={numberOfSpeakers}
                  setNumberOfSpeakers={setNumberOfSpeakers}
                  onSuggestStyle={withApiKeyCheck(handleSuggestStyleOptions)}
                  isSuggestingStyle={isSuggestingStyle}
                  styleSuggestionError={styleSuggestionError}
                />
              </div>
              <div className="w-full md:w-3/5 lg:w-2/3">
                <OutputDisplay
                  script={generatedScript}
                  isLoading={isLoading}
                  error={error}
                  onSaveToLibrary={handleSaveToLibrary}
                  onStartSequentialGenerate={withApiKeyCheck(handleStartSequentialGeneration)}
                  isGeneratingSequentially={isGeneratingSequentially}
                  onGenerateNextPart={withApiKeyCheck(handleGenerateNextPart)}
                  currentPart={currentPartIndex}
                  totalParts={outlineParts.length}
                  revisionPrompt={revisionPrompt}
                  setRevisionPrompt={setRevisionPrompt}
                  onRevise={withApiKeyCheck(handleReviseScript)}
                  revisionCount={revisionCount}
                  onExtractDialogue={withApiKeyCheck(handleExtractDialogue)}
                  isExtracting={isExtracting}
                  onGenerateVisualPrompt={withApiKeyCheck(handleGenerateVisualPrompt)}
                  onGenerateAllVisualPrompts={withApiKeyCheck(handleGenerateAllVisualPrompts)}
                  isGeneratingAllVisualPrompts={isGeneratingAllVisualPrompts}
                  onGenerateVideoPlan={withApiKeyCheck(handleGenerateVideoPlanFromScriptTab)}
                  isGeneratingVideoPlan={isGeneratingVideoPlan}
                  videoPlanError={videoPlanError}
                  hasGeneratedVideoPlan={!!videoPlanData}
                  scriptType={scriptType}
                  hasExtractedDialogue={hasExtractedDialogue}
                  hasGeneratedAllVisualPrompts={hasGeneratedAllVisualPrompts}
                  hasSavedToLibrary={hasSavedToLibrary}
                  visualPromptsCache={visualPromptsCache}
                />
              </div>
            </div>
        )}

        {activeTab === 'video' && (
            <VideoGeneratorTab 
              videoPlan={videoPlanData}
              onGeneratePlan={withApiKeyCheck(handleGenerateVideoPlanFromCustomScript)}
              isGenerating={isGeneratingVideoPlan}
              generationError={videoPlanError}
              onClearPlan={handleClearVideoPlan}
            />
        )}
      </main>
      
      <LibraryModal 
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        library={library}
        onLoad={handleLoadScript}
        onDelete={handleDeleteScript}
      />
      <DialogueModal
        isOpen={isDialogueModalOpen}
        onClose={() => setIsDialogueModalOpen(false)}
        dialogue={extractedDialogue}
        isLoading={isExtracting}
        error={extractionError}
      />
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        currentApiKeys={apiKeys}
        onAddKeys={handleAddApiKeys}
        onDeleteKey={handleDeleteApiKey}
      />
      <VisualPromptModal
        isOpen={isVisualPromptModalOpen}
        onClose={() => setIsVisualPromptModalOpen(false)}
        prompt={visualPrompt}
        isLoading={isGeneratingVisualPrompt}
        error={visualPromptError}
      />
      <AllVisualPromptsModal
        isOpen={isAllVisualPromptsModalOpen}
        onClose={() => setIsAllVisualPromptsModalOpen(false)}
        prompts={allVisualPrompts}
        isLoading={isGeneratingAllVisualPrompts}
        error={allVisualPromptsError}
      />
    </div>
  );
};

export default App;