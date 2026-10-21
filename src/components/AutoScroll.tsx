'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, ArrowUpToLine, Gauge, ChevronDown, ChevronUp } from 'lucide-react';

export const AutoScroll: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(2); // 1 = slowest, 5 = fastest
  const [isCollapsed, setIsCollapsed] = useState(false);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      // Milliseconds interval based on speed
      const intervalMs = 60 / speed;
      scrollIntervalRef.current = setInterval(() => {
        window.scrollBy({ top: 1, behavior: 'smooth' });

        // Check if reached bottom
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 5) {
          setIsPlaying(false);
        }
      }, intervalMs);
    } else {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    }

    return () => {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    };
  }, [isPlaying, speed]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 select-none">
      <div className="flex flex-col items-end gap-2">
        {/* Toggle Collapse button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 rounded-full shadow-lg backdrop-blur-md transition-all text-xs flex items-center gap-1 border border-zinc-700/50"
          title={isCollapsed ? 'Kaydırmayı Aç' : 'Gizle'}
        >
          {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {!isCollapsed && (
          <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900/90 text-white rounded-2xl shadow-2xl border border-zinc-800 backdrop-blur-md">
            {/* Play / Pause */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-2.5 rounded-xl font-bold transition-all flex items-center justify-center ${
                isPlaying
                  ? 'bg-amber-500 hover:bg-amber-600 text-black shadow-lg shadow-amber-500/20'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-white'
              }`}
              title={isPlaying ? 'Durdur' : 'Otomatik Kaydır'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            {/* Speed Selector */}
            <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-800/70 rounded-xl">
              <Gauge className="w-4 h-4 text-zinc-400" />
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`w-6 h-6 rounded-lg text-xs font-bold transition-all ${
                      speed === s
                        ? 'bg-amber-500 text-black'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Scroll to Top */}
            <button
              onClick={scrollToTop}
              className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-all"
              title="Başa Dön"
            >
              <ArrowUpToLine className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
