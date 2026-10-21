'use client';

import React from 'react';
import { SongEditor } from '@/components/SongEditor';

export default function NewSongPage() {
  return <SongEditor isNew={true} />;
}
