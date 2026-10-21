'use client';

import React from 'react';
import { parseChordPro } from '@/lib/chordpro';

interface ChordSheetProps {
  content: string;
  onChordClick?: (chord: string) => void;
  fontSize?: 'sm' | 'base' | 'lg' | 'xl';
}

export const ChordSheet: React.FC<ChordSheetProps> = ({
  content,
  onChordClick,
  fontSize = 'base',
}) => {
  const lines = parseChordPro(content);

  const fontSizes = {
    sm: { chord: 'text-xs', text: 'text-xs sm:text-sm' },
    base: { chord: 'text-xs sm:text-sm', text: 'text-sm sm:text-base' },
    lg: { chord: 'text-sm sm:text-base', text: 'text-base sm:text-lg' },
    xl: { chord: 'text-base sm:text-lg', text: 'text-lg sm:text-xl' },
  };

  const currentSize = fontSizes[fontSize] || fontSizes.base;

  return (
    <div className="flex flex-col space-y-4 font-sans leading-relaxed select-text max-w-full overflow-hidden">
      {lines.map((line, lineIdx) => {
        // If line is empty, render a spacer line
        const isBlank =
          line.segments.length === 1 &&
          !line.segments[0].chord &&
          line.segments[0].text.trim() === '';

        if (isBlank) {
          return <div key={`line-${lineIdx}`} className="h-4" />;
        }

        return (
          <div
            key={`line-${lineIdx}`}
            className="flex flex-wrap items-end max-w-full"
          >
            {line.segments.map((segment, segIdx) => (
              <div
                key={`seg-${lineIdx}-${segIdx}`}
                className="inline-flex flex-col items-start min-w-0"
              >
                {/* Chord Container */}
                <div className={`h-6 flex items-center ${currentSize.chord}`}>
                  {segment.chord ? (
                    <button
                      type="button"
                      onClick={() => onChordClick && onChordClick(segment.chord!)}
                      className="font-bold text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 transition-colors cursor-pointer select-none px-1 rounded bg-amber-500/10 hover:bg-amber-500/20 mr-1"
                    >
                      {segment.chord}
                    </button>
                  ) : (
                    <span className="invisible select-none">&nbsp;</span>
                  )}
                </div>

                {/* Lyric text */}
                <span className={`text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap break-words ${currentSize.text}`}>
                  {segment.text}
                </span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};
