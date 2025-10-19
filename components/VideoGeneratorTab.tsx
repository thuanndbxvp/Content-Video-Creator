import React, { useState, useEffect } from 'react';
import type { VideoPlan } from '../types';
import { FilmIcon } from './icons/FilmIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CameraIcon } from './icons/CameraIcon';

interface VideoGeneratorTabProps {
  videoPlan: VideoPlan | null;
}

const Placeholder: React.FC = () => (
    <div className="text-center text-text-secondary bg-secondary p-10 rounded-lg">
        <FilmIcon className="w-16 h-16 mx-auto mb-4 text-accent/50" />
        <h2 className="text-xl font-bold text-text-primary mb-2">Khu vực Tạo Video</h2>
        <p>Để bắt đầu, hãy tạo một kịch bản trong tab "Kịch bản", sau đó nhấn nút "Chuyển kịch bản thành Video".</p>
        <p>AI sẽ phân tích kịch bản của bạn thành các cảnh quay chi tiết và hiển thị chúng ở đây.</p>
    </div>
);

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

export const VideoGeneratorTab: React.FC<VideoGeneratorTabProps> = ({ videoPlan }) => {
  if (!videoPlan || videoPlan.parts.length === 0) {
    return <Placeholder />;
  }
  
  const totalScenes = videoPlan.parts.reduce((acc, part) => acc + part.scenes.length, 0);

  return (
    <div className="bg-secondary p-4 sm:p-6 rounded-lg shadow-xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-accent mb-3">Tổng quan Kịch bản</h2>
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
                          <FilmIcon className="w-12 h-12 text-secondary" />
                      </div>
                  </div>

                  <div className="lg:col-span-3">
                       <h4 className="text-base font-semibold text-text-primary mb-2">Mô tả Kịch bản</h4>
                       <p className="text-sm text-text-secondary leading-relaxed">{scene.detailedDescription}</p>
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