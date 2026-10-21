import React from 'react';
import { COMMON_CHORDS, ChordDefinition } from '@/lib/chordDb';

interface ChordDiagramProps {
  chordName: string;
  size?: number; // width in pixels
}

export const ChordDiagram: React.FC<ChordDiagramProps> = ({ chordName, size = 120 }) => {
  const chord: ChordDefinition | undefined = COMMON_CHORDS[chordName];

  if (!chord) {
    return (
      <div className="flex flex-col items-center justify-center p-2 border border-dashed rounded text-xs text-gray-400">
        <span className="font-bold text-amber-500">{chordName}</span>
        <span>Şema yok</span>
      </div>
    );
  }

  // Diagram geometry
  const width = size;
  const height = size * 1.25;
  const paddingX = width * 0.2;
  const paddingTop = height * 0.28;
  const paddingBottom = height * 0.12;
  const fretWidth = (width - paddingX * 2) / 5;
  const fretHeight = (height - paddingTop - paddingBottom) / 4;

  return (
    <div className="flex flex-col items-center">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="select-none">
        {/* Chord Name Title */}
        <text
          x={width / 2}
          y={paddingTop * 0.45}
          textAnchor="middle"
          className="fill-current text-gray-900 dark:text-white font-bold"
          fontSize={width * 0.16}
        >
          {chord.name}
        </text>

        {/* Nut (top thick line) */}
        <line
          x1={paddingX}
          y1={paddingTop}
          x2={width - paddingX}
          y2={paddingTop}
          stroke="currentColor"
          strokeWidth={4}
          className="text-gray-800 dark:text-gray-200"
        />

        {/* 4 Frets (horizontal lines below nut) */}
        {[1, 2, 3, 4].map((fretIndex) => (
          <line
            key={fretIndex}
            x1={paddingX}
            y1={paddingTop + fretIndex * fretHeight}
            x2={width - paddingX}
            y2={paddingTop + fretIndex * fretHeight}
            stroke="currentColor"
            strokeWidth={1}
            className="text-gray-400 dark:text-gray-600"
          />
        ))}

        {/* 6 Strings (vertical lines) */}
        {[0, 1, 2, 3, 4, 5].map((stringIndex) => (
          <line
            key={stringIndex}
            x1={paddingX + stringIndex * fretWidth}
            y1={paddingTop}
            x2={paddingX + stringIndex * fretWidth}
            y2={paddingTop + 4 * fretHeight}
            stroke="currentColor"
            strokeWidth={1.5}
            className="text-gray-600 dark:text-gray-400"
          />
        ))}

        {/* String Indicators on top of Nut (O or X) */}
        {chord.frets.map((fret, stringIndex) => {
          const x = paddingX + stringIndex * fretWidth;
          const y = paddingTop - 6;

          if (fret === -1) {
            // Muted string (X)
            return (
              <text
                key={`mute-${stringIndex}`}
                x={x}
                y={y}
                textAnchor="middle"
                className="fill-red-500 font-bold"
                fontSize={width * 0.1}
              >
                ×
              </text>
            );
          }
          if (fret === 0) {
            // Open string (O)
            return (
              <circle
                key={`open-${stringIndex}`}
                cx={x}
                cy={y - 3}
                r={width * 0.035}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                className="text-emerald-500"
              />
            );
          }
          return null;
        })}

        {/* Finger Dots on Frets */}
        {chord.frets.map((fret, stringIndex) => {
          if (fret <= 0) return null;
          const cx = paddingX + stringIndex * fretWidth;
          const cy = paddingTop + (fret - 0.5) * fretHeight;
          const finger = chord.fingers ? chord.fingers[stringIndex] : null;

          return (
            <g key={`dot-${stringIndex}`}>
              <circle
                cx={cx}
                cy={cy}
                r={width * 0.065}
                className="fill-amber-500"
              />
              {finger && finger > 0 && (
                <text
                  x={cx}
                  y={cy + 3}
                  textAnchor="middle"
                  className="fill-white font-bold text-[10px]"
                >
                  {finger}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
