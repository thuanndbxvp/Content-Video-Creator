import React, { useState, useEffect } from 'react';
import type { VideoPlan, PromptPair } from '../types';
import { FilmIcon } from './icons/FilmIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';

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
            className="absolute top-2 right-2 flex items-center space-x-1 bg-primary/70 hover:bg-primary text-text-secondary px-2 py-1 rounded-md text-xs font-semibold transition opacity-50 hover:opacity-100"
            aria-label="Sao chép prompt"
        >
            <ClipboardIcon className="w-3 h-3" />
            <span>{copied ? 'Đã chép!' : 'Chép'}</span>
        </button>
    );
};

const PromptDisplay: React.FC<{ prompt: PromptPair, title: string }> = ({ prompt, title }) => (
    <div className="space-y-2">
        <h4 className="text-xs font-bold text-accent">{title}</h4>
        <div className="relative">
            <p className="text-xs font-mono bg-primary/70 p-2 pr-12 rounded border border-secondary text-text-primary/90 whitespace-pre-wrap">{prompt.english}</p>
            <CopyButton text={prompt.english} />
        </div>
        <p className="text-xs italic text-text-secondary/80 mt-1 pl-2 border-l-2 border-secondary/50">{prompt.vietnamese}</p>
    </div>
);


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

      <div className="space-y-8">
        {videoPlan.parts.map((part, index) => (
          <div key={index}>
            <h3 className="text-xl font-bold text-accent/90 mb-4 border-b-2 border-accent/30 pb-2">{part.partTitle}</h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] border-collapse text-sm">
                <thead className="bg-primary/50 text-left">
                  <tr>
                    <th className="p-3 w-[80px] font-semibold text-text-primary">STT/Phân cảnh</th>
                    <th className="p-3 w-[100px] font-semibold text-text-primary">Thời gian</th>
                    <th className="p-3 w-[25%] font-semibold text-text-primary">Mô tả Kịch bản Chi tiết</th>
                    <th className="p-3 w-[35%] font-semibold text-text-primary">Prompt Tạo Ảnh (Whisk, Gemini)</th>
                    <th className="p-3 w-[35%] font-semibold text-text-primary">Prompt Tạo Chuyển động (Veo 3.1)</th>
                  </tr>
                </thead>
                <tbody>
                  {part.scenes.map(scene => (
                    <tr key={scene.sceneNumber} className="border-b border-primary/80 hover:bg-primary/40 transition-colors">
                      <td className="p-3 align-top text-center font-bold text-text-primary">{scene.sceneNumber}</td>
                      <td className="p-3 align-top text-center font-semibold text-text-secondary">8 giây</td>
                      <td className="p-3 align-top text-text-secondary">{scene.detailedDescription}</td>
                      <td className="p-3 align-top">
                        <PromptDisplay prompt={scene.imagePrompt} title="Prompt Ảnh" />
                      </td>
                      <td className="p-3 align-top">
                        <PromptDisplay prompt={scene.motionPrompt} title="Prompt Chuyển động" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
