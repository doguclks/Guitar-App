'use client';

import React from 'react';
import { ArrowDown, ArrowUp, X } from 'lucide-react';

interface StrummingPatternProps {
  pattern?: string | null; // e.g. "↓  ↓↑  ↑↓↑" or "A-AY-YA-Y"
  bpm?: number | null;
  timeSignature?: string | null;
  capo?: number | null;
}

export const StrummingPattern: React.FC<StrummingPatternProps> = ({
  pattern,
  bpm,
  timeSignature = '4/4',
  capo,
}) => {
  // If pattern uses arrows or Turkish notation (A: Aşağı, Y: Yukarı, K: Kapatma)
  const renderStrumArrows = (text: string) => {
    const chars = text.split('');
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        {chars.map((char, index) => {
          if (char === '↓' || char.toUpperCase() === 'A') {
            return (
              <span
                key={index}
                className="flex flex-col items-center justify-center w-7 h-8 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 text-emerald-500 font-bold"
                title="Aşağı vuruş (Down)"
              >
                <ArrowDown className="w-4 h-4 stroke-[2.5]" />
              </span>
            );
          }
          if (char === '↑' || char.toUpperCase() === 'Y') {
            return (
              <span
                key={index}
                className="flex flex-col items-center justify-center w-7 h-8 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 text-sky-500 font-bold"
                title="Yukarı vuruş (Up)"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </span>
            );
          }
          if (char === '✕' || char.toUpperCase() === 'K') {
            return (
              <span
                key={index}
                className="flex flex-col items-center justify-center w-7 h-8 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 text-red-500 font-bold"
                title="Kapatma / Mute"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </span>
            );
          }
          if (char === ' ' || char === '-') {
            return <span key={index} className="w-2 text-center text-zinc-400 font-mono">•</span>;
          }
          return (
            <span
              key={index}
              className="flex items-center justify-center w-7 h-8 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-xs"
            >
              {char}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-4 p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm">
      {/* Ritim Kalıbı */}
      {pattern && (
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
            Ritim Kalıbı
          </span>
          {renderStrumArrows(pattern)}
        </div>
      )}

      {/* BPM */}
      {bpm && (
        <div className="flex flex-col gap-0.5 border-l border-zinc-200 dark:border-zinc-800 pl-4">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
            Tempo
          </span>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
            {bpm} <span className="text-xs font-normal text-zinc-400">BPM</span>
          </span>
        </div>
      )}

      {/* Ölçü */}
      {timeSignature && (
        <div className="flex flex-col gap-0.5 border-l border-zinc-200 dark:border-zinc-800 pl-4">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
            Ölçü
          </span>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
            {timeSignature}
          </span>
        </div>
      )}

      {/* Capo */}
      {capo !== undefined && capo !== null && (
        <div className="flex flex-col gap-0.5 border-l border-zinc-200 dark:border-zinc-800 pl-4">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
            Kapo
          </span>
          <span className="font-semibold text-amber-500">
            {capo === 0 ? 'Yok' : `${capo}. Perde`}
          </span>
        </div>
      )}
    </div>
  );
};
