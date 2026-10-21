import { ChordLine, ChordSegment } from './types';

/**
 * Splits a segment with multiple words into individual word segments,
 * so the browser can wrap lines naturally at word boundaries without overflowing mobile screens.
 */
function splitSegmentWords(segment: ChordSegment): ChordSegment[] {
  // If there are no spaces or only leading spaces, keep as is
  if (!segment.text.includes(' ') || segment.text.trim().length === 0) {
    return [segment];
  }

  // Split text after each space character (preserving spaces attached to each word)
  const wordParts = segment.text.split(/(?<=\s)/);
  if (wordParts.length <= 1) {
    return [segment];
  }

  const result: ChordSegment[] = [];

  // First word keeps the original chord
  result.push({
    chord: segment.chord,
    text: wordParts[0],
  });

  // Subsequent words have no chord
  for (let i = 1; i < wordParts.length; i++) {
    result.push({
      chord: null,
      text: wordParts[i],
    });
  }

  return result;
}

/**
 * Parses a ChordPro formatted text string into structured lines and segments.
 * Example input:
 * "[Am]Akdeniz ak[Em]samlari bir [F]baska olu[G]yor"
 */
export function parseChordPro(rawText: string): ChordLine[] {
  if (!rawText) return [];
  const lines = rawText.split('\n');

  return lines.map((line) => {
    // If the line is empty or purely whitespace
    if (line.trim().length === 0) {
      return { segments: [{ chord: null, text: '' }] };
    }

    const rawSegments: ChordSegment[] = [];
    const regex = /\[(.*?)\]([^\[]*)/g;
    let match: RegExpExecArray | null;

    // Check if there is initial text before the first bracket
    const initialMatch = line.match(/^([^\[]+)/);
    if (initialMatch && !line.startsWith('[')) {
      rawSegments.push({ chord: null, text: initialMatch[1] });
    }

    while ((match = regex.exec(line)) !== null) {
      rawSegments.push({
        chord: match[1].trim(),
        text: match[2],
      });
    }

    // If there were no chord brackets found, treat whole line as pure text
    if (rawSegments.length === 0) {
      rawSegments.push({ chord: null, text: line });
    }

    // Expand segments that contain spaces into word-wrapped units
    const segments: ChordSegment[] = [];
    for (const seg of rawSegments) {
      segments.push(...splitSegmentWords(seg));
    }

    return { segments };
  });
}

/**
 * Extracts all unique chords used in a ChordPro text.
 * Example: ["Am", "Em", "F", "G"]
 */
export function extractUniqueChords(rawText: string): string[] {
  if (!rawText) return [];
  const matches = rawText.matchAll(/\[(.*?)\]/g);
  const chords = new Set<string>();

  for (const match of matches) {
    const chord = match[1].trim();
    if (chord) chords.add(chord);
  }

  return Array.from(chords);
}
