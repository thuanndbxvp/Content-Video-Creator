import React from 'react';
import type { ScriptPartSummary } from '../types';
import { FilmIcon } from './icons/FilmIcon';

interface VideoGeneratorTabProps {
  sceneData: ScriptPartSummary[] | null;
}

const Placeholder: React.FC = () => (
    <div className="text-center text-text-secondary bg-secondary p-10 rounded-lg">
        <FilmIcon className="w-16 h-16 mx-auto mb-4 text-accent/50" />
        <h2 className="text-xl font-bold text-text-primary mb-2">Khu vực Tạo Video</h2>
        <p>Để bắt đầu, hãy tạo một kịch bản trong tab "Kịch bản", sau đó nhấn nút "Chuyển kịch bản thành Video".</p>
        <p>AI sẽ phân tích kịch bản của bạn thành các cảnh quay chi tiết và hiển thị chúng ở đây.</p>
    </div>
);

export const VideoGeneratorTab: React.FC<VideoGeneratorTabProps> = ({ sceneData }) => {
  if (!sceneData || sceneData.length === 0) {
    return <Placeholder />;
  }

  return (
    <div className="bg-secondary p-4 sm:p-6 rounded-lg shadow-xl">
        <div className="space-y-8">
            {sceneData.map((part, index) => (
                <div key={index} className="bg-primary/50 p-4 rounded-lg">
                    <h3 className="text-xl font-bold text-accent mb-4 border-b border-secondary pb-3">{part.partTitle}</h3>
                    <div className="space-y-6">
                        {part.scenes.map(scene => (
                            <div key={scene.sceneNumber} className="border-t border-secondary/50 pt-4">
                                <p className="text-md text-text-primary mb-2">
                                    <strong className="font-semibold">Cảnh {scene.sceneNumber}:</strong> {scene.summary}
                                </p>
                                <div className="mt-2">
                                    <label className="block text-xs font-semibold text-text-secondary mb-1">Prompt Video (Tiếng Anh)</label>
                                    <textarea
                                        readOnly
                                        rows={3}
                                        className="w-full bg-primary/70 border border-secondary rounded-md p-2 text-text-primary resize-y text-sm font-mono focus:ring-accent focus:border-accent"
                                        value={scene.visualPrompt}
                                    />
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