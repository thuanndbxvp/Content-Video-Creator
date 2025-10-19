import React, { useState, useEffect } from 'react';
import type { VideoPlan } from '../types';
import { FilmIcon } from './icons/FilmIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CameraIcon } from './icons/CameraIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { ArrowPathIcon } from './icons/ArrowPathIcon';

interface VideoPlanGeneratorFormProps {
    onGeneratePlan: (script: string) => void;
    isGenerating: boolean;
    generationError: string | null;
}

const VideoPlanGeneratorForm: React.FC<VideoPlanGeneratorFormProps> = ({ onGeneratePlan, isGenerating, generationError }) => {
    const [customScript, setCustomScript] = useState('');

    const handleSubmit = () => {
        onGeneratePlan(customScript);
    };

    return (
        <div className="bg-secondary p-6 rounded-lg shadow-xl max-w-4xl mx-auto">
            <div className="text-center mb-6">
                 <FilmIcon className="w-16 h-16 mx-auto mb-4 text-accent/50" />
                 <h2 className="text-2xl font-bold text-accent">Tạo Kế hoạch Video từ Kịch bản có sẵn</h2>
                 <p className="text-text-secondary mt-2">
                    Dán kịch bản video của bạn vào đây. AI sẽ phân tích và tạo một storyboard chi tiết để bạn sản xuất.
                </p>
            </div>
            
            <textarea
                value={customScript}
                onChange={(e) => setCustomScript(e.target.value)}
                rows={15}
                className="w-full bg-primary/70 border border-secondary rounded-md p-3 text-text-primary focus:ring-2 focus:ring-accent focus:border-accent transition"
                placeholder="Dán toàn bộ kịch bản của bạn vào đây..."
                disabled={isGenerating}
            />

            <button
                onClick={handleSubmit}
                disabled={isGenerating || !customScript.trim()}
                className="w-full mt-4 flex items-center justify-center bg-accent hover:bg-indigo-500 disabled:bg-indigo-400/50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-transform duration-200 ease-in-out transform hover:scale-105"
            >
                 {isGenerating ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Đang phân tích và tạo kế hoạch...</span>
                    </>
                ) : (
                    <>
                        <FilmIcon className="w-5 h-5 mr-2" />
                        <span>Tạo Kế hoạch Video</span>
                    </>
                )}
            </button>
            
            {isGenerating && !customScript && (
                <div className="text-center mt-4">
                    <p className="text-text-secondary">Đang xử lý kế hoạch video từ tab Kịch bản...</p>
                </div>
            )}
            
            {generationError && (
                <div className="mt-4 bg-red-900/50 text-red-400 p-3 rounded-md text-sm text-center">
                    <p>{generationError}</p>
                </div>
            )}
        </div>
    );
};


interface VideoGeneratorTabProps {
  videoPlan: VideoPlan | null;
  onGeneratePlan: (script: string) => void;
  isGenerating: boolean;
  generationError: string | null;
  onClearPlan: () => void;
}

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (copied) {
            const timer = setTimeout(() => setCopied(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [copied]);

    const handleCopy = () => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
        });
    };

    return (
        <button
            onClick={handleCopy}
            className="absolute top-2 right-2 flex items-center space-x-1 bg-primary/70 hover:bg-primary text-text-secondary px-2 py-1 rounded-md text-xs font-semibold transition opacity-50 hover:opacity-100 focus:opacity-100"
            aria-label="Sao chép prompt"
        >
            <ClipboardIcon className="w-3 h-3" />
            <span>{copied ? 'Đã chép!' : 'Chép'}</span>
        </button>
    );
};

export const VideoGeneratorTab: React.FC<VideoGeneratorTabProps> = ({ videoPlan, onGeneratePlan, isGenerating, generationError, onClearPlan }) => {
  if (!videoPlan || isGenerating) {
    return <VideoPlanGeneratorForm 
        onGeneratePlan={onGeneratePlan}
        isGenerating={isGenerating}
        generationError={generationError}
    />;
  }
  
  const totalScenes = videoPlan.parts.reduce((acc, part) => acc + part.scenes.length, 0);

  return (
    <div className="bg-secondary p-4 sm:p-6 rounded-lg shadow-xl space-y-8">
      <div>
        <div className="flex justify-between items-center flex-wrap gap-2 mb-3">
            <h2 className="text-2xl font-bold text-accent">Tổng quan Kế hoạch Video</h2>
            <button 
                onClick={onClearPlan}
                className="flex items-center gap-2 px-4 py-2 bg-primary/70 hover:bg-primary text-text-secondary font-semibold rounded-lg transition-colors text-sm"
                aria-label="Tạo kế hoạch mới"
            >
                <ArrowPathIcon className="w-4 h-4" />
                <span>Tạo kế hoạch mới</span>
            </button>
        </div>
        
        <h3 className="text-lg font-semibold text-text-primary mt-6 mb-2 flex items-center gap-2">
            <UserCircleIcon className="w-6 h-6 text-accent"/>
            Character Bible (Hồ sơ Nhân vật)
        </h3>
        <p className="text-text-secondary bg-primary/50 p-4 rounded-lg border border-secondary whitespace-pre-wrap font-mono text-sm">{videoPlan.characterBible}</p>

        <h3 className="text-lg font-semibold text-text-primary mt-6 mb-2">Tóm tắt Kịch bản</h3>
        <p className="text-text-secondary bg-primary/50 p-4 rounded-lg border border-secondary">{videoPlan.scriptSummary}</p>
        
        <p className="text-sm text-text-secondary mt-3 text-right">Tổng thời lượng dự kiến: <span className="font-bold text-text-primary">{totalScenes * 8} giây</span> ({totalScenes} cảnh)</p>
      </div>

      <div className="space-y-10">
        {videoPlan.parts.map((part, partIndex) => (
          <div key={partIndex}>
            <h3 className="text-2xl font-bold text-accent/90 mb-4 border-b-2 border-accent/30 pb-2">{part.partTitle}</h3>
            <div className="space-y-6">
              {part.scenes.map(scene => (
                <div key={scene.sceneNumber} className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-primary/40 p-4 rounded-lg border border-secondary/50">
                  <div className="lg:col-span-2 flex flex-col items-center text-center">
                      <p className="font-bold text-accent text-xl">Cảnh {partIndex + 1}.{scene.sceneNumber}</p>
                      <p className="text-sm text-text-secondary mb-3">~8 giây</p>
                      <div className="w-full aspect-video bg-primary flex items-center justify-center rounded-md border border-secondary">
                          <CameraIcon className="w-12 h-12 text-secondary" />
                      </div>
                  </div>

                  <div className="lg:col-span-3">
                       <h4 className="text-base font-semibold text-text-primary mb-2">Trích đoạn Kịch bản</h4>
                       <p className="text-sm text-text-secondary leading-relaxed italic bg-primary/50 p-3 rounded-md border-l-4 border-accent/50">"{scene.scriptExcerpt}"</p>
                  </div>

                  <div className="lg:col-span-7 space-y-4">
                      <div>
                          <h4 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
                              <CameraIcon className="w-5 h-5 text-accent" />
                              Prompt Tạo Ảnh (Frame đầu)
                          </h4>
                          <div className="relative">
                              <textarea readOnly rows={4} className="w-full text-xs font-mono bg-primary/70 p-3 pr-20 rounded border border-secondary text-text-primary/90 resize-y focus:ring-1 focus:ring-accent transition-shadow">{scene.imagePrompt.english}</textarea>
                              <CopyButton text={scene.imagePrompt.english} />
                          </div>
                          <p className="text-xs italic text-text-secondary/80 mt-1 pl-2 border-l-2 border-secondary/50">{scene.imagePrompt.vietnamese}</p>
                      </div>

                      <div>
                          <h4 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
                             <FilmIcon className="w-5 h-5 text-accent" />
                             Prompt Chuyển động (Video 8s)
                          </h4>
                           <div className="relative">
                              <textarea readOnly rows={4} className="w-full text-xs font-mono bg-primary/70 p-3 pr-20 rounded border border-secondary text-text-primary/90 resize-y focus:ring-1 focus:ring-accent transition-shadow">{scene.motionPrompt.english}</textarea>
                              <CopyButton text={scene.motionPrompt.english} />
                           </div>
                          <p className="text-xs italic text-text-secondary/80 mt-1 pl-2 border-l-2 border-secondary/50">{scene.motionPrompt.vietnamese}</p>
                      </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Add the UserCircleIcon component used in the tab
const UserCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);