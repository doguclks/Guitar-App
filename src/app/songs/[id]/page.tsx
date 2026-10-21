'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Song } from '@/lib/types';
import { extractUniqueChords } from '@/lib/chordpro';
import { ChordSheet } from '@/components/ChordSheet';
import { StrummingPattern } from '@/components/StrummingPattern';
import { ChordModal } from '@/components/ChordModal';
import { AutoScroll } from '@/components/AutoScroll';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  ZoomIn,
  ZoomOut,
  Music,
} from 'lucide-react';

function SongDetailContent() {
  const params = useParams();
  const songId = params?.id as string;
  const router = useRouter();

  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChord, setSelectedChord] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');

  useEffect(() => {
    if (!songId) return;

    async function fetchSong() {
      setLoading(true);
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

    fetchSong();

    // Realtime subscription: updates automatically if changed on desktop!
    const channel = supabase
      .channel(`song-${songId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'songs',
          filter: `id=eq.${songId}`,
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            router.push('/');
          } else if (payload.new) {
            setSong(payload.new as Song);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [songId, router]);

  const handleDelete = async () => {
    if (!confirm('Bu şarkıyı silmek istediğine emin misin?')) return;
    await supabase.from('songs').delete().eq('id', songId);
    router.push('/');
  };

  const handleChordClick = (chord: string) => {
    setSelectedChord(chord);
    setIsModalOpen(true);
  };

  const fontOptions: Array<'sm' | 'base' | 'lg' | 'xl'> = ['sm', 'base', 'lg', 'xl'];
  const increaseFontSize = () => {
    const nextIdx = Math.min(fontOptions.indexOf(fontSize) + 1, fontOptions.length - 1);
    setFontSize(fontOptions[nextIdx]);
  };
  const decreaseFontSize = () => {
    const prevIdx = Math.max(fontOptions.indexOf(fontSize) - 1, 0);
    setFontSize(fontOptions[prevIdx]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-500">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Şarkı yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!song) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 p-6">
        <Music className="w-12 h-12 text-zinc-400 mb-2" />
        <p className="text-lg font-medium">Şarkı bulunamadı</p>
        <Link
          href="/"
          className="mt-4 px-4 py-2 bg-amber-500 text-black font-semibold rounded-xl text-sm"
        >
          Şarkı Listesine Dön
        </Link>
      </div>
    );
  }

  const chordsInSong = extractUniqueChords(song.content);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pb-28">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 -ml-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-base font-bold truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                {song.title}
              </h1>
              {song.artist && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                  {song.artist}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Font Zoom Controls */}
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5">
              <button
                onClick={decreaseFontSize}
                className="p-1.5 text-zinc-600 dark:text-zinc-300 hover:text-amber-500 transition-colors"
                title="Yazıyı Küçült"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={increaseFontSize}
                className="p-1.5 text-zinc-600 dark:text-zinc-300 hover:text-amber-500 transition-colors"
                title="Yazıyı Büyüt"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Desktop Edit Link */}
            <Link
              href={`/songs/edit/${song.id}`}
              className="p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1 text-sm font-medium"
              title="Düzenle"
            >
              <Edit3 className="w-4 h-4" />
              <span className="hidden sm:inline">Düzenle</span>
            </Link>

            {/* Delete */}
            <button
              onClick={handleDelete}
              className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              title="Sil"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-2.5 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Ritim & Tempo Bilgisi */}
        {(song.strumming_pattern || song.bpm || song.capo !== undefined) && (
          <StrummingPattern
            pattern={song.strumming_pattern}
            bpm={song.bpm}
            timeSignature={song.time_signature}
            capo={song.capo}
          />
        )}

        {/* Şarkıda Geçen Akorlar Barı */}
        {chordsInSong.length > 0 && (
          <div className="flex flex-col gap-2 p-3 bg-zinc-100/70 dark:bg-zinc-900/40 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Bu Şarkıdaki Akorlar (Şemaya bakmak için tıkla)
            </span>
            <div className="flex flex-wrap gap-2">
              {chordsInSong.map((chord) => (
                <button
                  key={chord}
                  onClick={() => handleChordClick(chord)}
                  className="px-3 py-1.5 bg-white dark:bg-zinc-800 hover:bg-amber-500 hover:text-black dark:hover:bg-amber-500 dark:hover:text-black font-bold text-amber-600 dark:text-amber-400 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 transition-all text-sm flex items-center gap-1 cursor-pointer"
                >
                  <span>{chord}</span>
                  <span className="text-[10px] opacity-60">Şema</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Ana Akor & Söz Sayfası (ChordSheet) */}
        <div className="p-3.5 sm:p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <ChordSheet
            content={song.content}
            onChordClick={handleChordClick}
            fontSize={fontSize}
          />
        </div>
      </main>

      {/* Floating Auto-Scroll Widget */}
      <AutoScroll />

      {/* Akor Şeması Popup Modal */}
      <ChordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedChord={selectedChord}
        allChords={chordsInSong}
        onSelectChord={(ch) => setSelectedChord(ch)}
      />
    </div>
  );
}

export default function SongDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-500">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SongDetailContent />
    </Suspense>
  );
}
