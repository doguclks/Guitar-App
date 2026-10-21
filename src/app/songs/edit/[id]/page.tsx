'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Song } from '@/lib/types';
import { SongEditor } from '@/components/SongEditor';

function EditSongContent() {
  const params = useParams();
  const songId = params?.id as string;

  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!songId) return;

    async function loadSong() {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('id', songId)
        .single();

      if (!error && data) {
        setSong(data as Song);
      }
      setLoading(false);
    }

    loadSong();
  }, [songId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-500">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!song) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-zinc-500">Şarkı bulunamadı.</p>
      </div>
    );
  }

  return <SongEditor initialSong={song} isNew={false} />;
}

export default function EditSongPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-500">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <EditSongContent />
    </Suspense>
  );
}
