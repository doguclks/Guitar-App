'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Song } from '@/lib/types';
import { SAMPLE_SONGS } from '@/lib/sampleSongs';
import { extractUniqueChords } from '@/lib/chordpro';
import {
  Music,
  Plus,
  Search,
  Sparkles,
  ChevronRight,
  Gauge,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function HomePage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [seeding, setSeeding] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchSongs = async () => {
    try {
      setErrorMsg(null);
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase fetch error:', error);
        setErrorMsg(error.message);
      } else if (data) {
        setSongs(data as Song[]);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Bağlantı hatası';
      console.error('Fetch caught error:', err);
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();

    // Realtime subscription: When you add/edit on desktop, phone sees it instantly!
    const channel = supabase
      .channel('songs-list')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'songs' },
        () => {
          fetchSongs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSeedSamples = async () => {
    setSeeding(true);
    const { error } = await supabase.from('songs').insert(SAMPLE_SONGS);
    if (error) {
      alert('Örnek şarkıları yükleme hatası: ' + error.message);
    } else {
      await fetchSongs();
    }
    setSeeding(false);
  };

  const filteredSongs = songs.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      (s.artist && s.artist.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden shadow-sm">
              <img src="/icon.png" alt="Guitar App" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight flex items-center gap-1.5">
                Guitar App
                <span className="text-[10px] font-semibold bg-amber-500 text-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  Sync
                </span>
              </h1>
              <p className="text-xs text-zinc-500">Masaüstü & Mobil Pratik Rehberi</p>
            </div>
          </div>

          <Link
            href="/songs/new"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-black font-bold rounded-xl text-sm transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Şarkı Ekle</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto w-full px-4 py-6 flex-1 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Şarkı veya sanatçı ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
          />
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-sm flex items-center justify-between">
            <span>Bağlantı uyarısı: {errorMsg}</span>
            <button
              onClick={fetchSongs}
              className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-colors"
            >
              Tekrar Dene
            </button>
          </div>
        )}

        {/* Content State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-400">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Şarkılar yükleniyor...</span>
          </div>
        ) : songs.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">
              <Music className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold mb-1">Henüz Şarkı Eklenmemiş</h2>
            <p className="text-sm text-zinc-500 max-w-sm mb-6">
              İlk şarkını masaüstünden ekleyebilir veya hemen denemek için hazır örnek şarkıları tek tıkla yükleyebilirsin.
            </p>

            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={handleSeedSamples}
                disabled={seeding}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl text-sm transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{seeding ? 'Yükleniyor...' : 'Örnek Şarkıları Yükle (3 Adet)'}</span>
              </button>

              <Link
                href="/songs/new"
                className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold rounded-xl text-sm transition-all"
              >
                Kendin Yeni Şarkı Ekle
              </Link>
            </div>
          </div>
        ) : (
          // Song List
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-500 font-medium px-1">
              <span>Şarkılarım ({filteredSongs.length})</span>
              <span>Pratik yapmak için birine dokun</span>
            </div>

            {filteredSongs.map((song) => {
              const chords = extractUniqueChords(song.content);

              return (
                <Link
                  key={song.id}
                  href={`/songs/${song.id}`}
                  className="group block p-4 bg-white dark:bg-zinc-900 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 hover:border-amber-500/40 dark:hover:border-amber-500/40 transition-all shadow-sm"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base group-hover:text-amber-500 transition-colors truncate">
                          {song.title}
                        </h3>
                        {song.capo !== undefined && song.capo !== null && song.capo > 0 && (
                          <span className="text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md border border-amber-500/20 shrink-0">
                            Kapo {song.capo}
                          </span>
                        )}
                      </div>

                      {song.artist && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                          {song.artist}
                        </p>
                      )}

                      {/* Info Badges & Chords */}
                      <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                        {song.bpm && (
                          <span className="flex items-center gap-1 text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                            <Gauge className="w-3 h-3" />
                            {song.bpm} BPM
                          </span>
                        )}

                        {song.strumming_pattern && (
                          <span className="text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md font-mono text-[11px]">
                            {song.strumming_pattern}
                          </span>
                        )}

                        {/* Chords preview */}
                        {chords.length > 0 && (
                          <div className="flex items-center gap-1 ml-auto">
                            {chords.slice(0, 5).map((chord) => (
                              <span
                                key={chord}
                                className="px-1.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold rounded text-[11px]"
                              >
                                {chord}
                              </span>
                            ))}
                            {chords.length > 5 && (
                              <span className="text-[10px] text-zinc-400">
                                +{chords.length - 5}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
