export interface Song {
  id: string;
  title: string;
  artist?: string | null;
  content: string; // ChordPro format lyrics + chords
  strumming_pattern?: string | null; // e.g. "↓  ↓↑  ↑↓↑" or "A-AY-YA-Y"
  bpm?: number | null;
  time_signature?: string | null;
  capo?: number | null;
  created_at: string;
  updated_at: string;
}

export interface ChordSegment {
  chord: string | null;
  text: string;
}

export interface ChordLine {
  segments: ChordSegment[];
}
