export interface ChordDefinition {
  name: string;
  frets: number[]; // 6 strings from low E (string 6) to high E (string 1). -1 means muted (X), 0 means open (O)
  fingers?: number[]; // finger 1 (index), 2 (middle), 3 (ring), 4 (pinky)
  barre?: { fret: number; fromString: number; toString: number };
}

export const COMMON_CHORDS: Record<string, ChordDefinition> = {
  Am: {
    name: 'Am',
    frets: [-1, 0, 2, 2, 1, 0],
    fingers: [0, 0, 2, 3, 1, 0],
  },
  A: {
    name: 'A',
    frets: [-1, 0, 2, 2, 2, 0],
    fingers: [0, 0, 1, 2, 3, 0],
  },
  C: {
    name: 'C',
    frets: [-1, 3, 2, 0, 1, 0],
    fingers: [0, 3, 2, 0, 1, 0],
  },
  D: {
    name: 'D',
    frets: [-1, -1, 0, 2, 3, 2],
    fingers: [0, 0, 0, 1, 3, 2],
  },
  Dm: {
    name: 'Dm',
    frets: [-1, -1, 0, 2, 3, 1],
    fingers: [0, 0, 0, 2, 3, 1],
  },
  E: {
    name: 'E',
    frets: [0, 2, 2, 1, 0, 0],
    fingers: [0, 2, 3, 1, 0, 0],
  },
  Em: {
    name: 'Em',
    frets: [0, 2, 2, 0, 0, 0],
    fingers: [0, 2, 3, 0, 0, 0],
  },
  G: {
    name: 'G',
    frets: [3, 2, 0, 0, 0, 3],
    fingers: [2, 1, 0, 0, 0, 3],
  },
  F: {
    name: 'F',
    frets: [1, 3, 3, 2, 1, 1],
    barre: { fret: 1, fromString: 6, toString: 1 },
    fingers: [1, 3, 4, 2, 1, 1],
  },
  Bm: {
    name: 'Bm',
    frets: [-1, 2, 4, 4, 3, 2],
    barre: { fret: 2, fromString: 5, toString: 1 },
    fingers: [0, 1, 3, 4, 2, 1],
  },
  B7: {
    name: 'B7',
    frets: [-1, 2, 1, 2, 0, 2],
    fingers: [0, 2, 1, 3, 0, 4],
  },
};
