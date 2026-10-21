'use client';

import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ChordDiagram } from './ChordDiagram';

interface ChordModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedChord: string | null;
  allChords?: string[];
  onSelectChord?: (chord: string) => void;
}

export const ChordModal: React.FC<ChordModalProps> = ({
  isOpen,
  onClose,
  selectedChord,
  allChords = [],
  onSelectChord,
}) => {
  if (!isOpen || !selectedChord) return null;

  const currentIndex = allChords.indexOf(selectedChord);

  const handlePrev = () => {
    if (currentIndex > 0 && onSelectChord) {
      onSelectChord(allChords[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < allChords.length - 1 && onSelectChord) {
      onSelectChord(allChords[currentIndex + 1]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xs bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header & Navigation */}
        <div className="w-full flex items-center justify-between mb-4 mt-1 px-2">
          <button
            onClick={handlePrev}
            disabled={currentIndex <= 0}
            className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-20 disabled:hover:text-zinc-400 transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <span className="text-xl font-bold text-amber-500 tracking-wide">
            {selectedChord} Akoru
          </span>

          <button
            onClick={handleNext}
            disabled={currentIndex >= allChords.length - 1 || currentIndex === -1}
            className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-20 disabled:hover:text-zinc-400 transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Chord Diagram */}
        <div className="my-2 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800 w-full flex justify-center">
          <ChordDiagram chordName={selectedChord} size={150} />
        </div>

        {/* Quick Chord Selector Pills */}
        {allChords.length > 1 && (
          <div className="mt-4 flex flex-wrap gap-1.5 justify-center max-w-full">
            {allChords.map((chord) => (
              <button
                key={chord}
                onClick={() => onSelectChord && onSelectChord(chord)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  chord === selectedChord
                    ? 'bg-amber-500 text-black shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {chord}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-medium rounded-xl text-sm transition-all"
        >
          Tamam
        </button>
      </div>
    </div>
  );
};
