'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Song } from '@/lib/types';
import { ChordSheet } from './ChordSheet';
import { StrummingPattern } from './StrummingPattern';
import {
  Save,
  ArrowLeft,
  Eye,
  Edit,
  Sparkles,
  HelpCircle,
  Plus,
} from 'lucide-react';

interface SongEditorProps {
  initialSong?: Partial<Song>;
  isNew?: boolean;
}

const COMMON_CHORDS_BAR = ['Am', 'C', 'D', 'Dm', 'E', 'Em', 'F', 'G', 'A', 'Bm', 'B7'];

const RHYTHM_PRESETS = [
  { label: '4/4 Pop (A-AY-YA-Y)', pattern: 'A-AY-YA-Y' },
  { label: '4/4 Oklar (↓ ↓↑ ↑↓↑)', pattern: '↓  ↓↑  ↑↓↑' },
  { label: '3/4 Vals (A-Y-Y)', pattern: 'A-Y-Y' },
  { label: '2/4 Marş (A-AY)', pattern: 'A-AY' },
];

export const SongEditor: React.FC<SongEditorProps> = ({ initialSong, isNew = false }) => {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState(initialSong?.title || '');
  const [artist, setArtist] = useState(initialSong?.artist || '');
  const [content, setContent] = useState(initialSong?.content || '');
  const [strummingPattern, setStrummingPattern] = useState(initialSong?.strumming_pattern || 'A-AY-YA-Y');
  const [bpm, setBpm] = useState<number>(initialSong?.bpm || 110);
  const [timeSignature, setTimeSignature] = useState(initialSong?.time_signature || '4/4');
  const [capo, setCapo] = useState<number>(initialSong?.capo || 0);

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [customChord, setCustomChord] = useState('');

  // Insert chord tag [Am] at current textarea cursor position
  const insertChord = (chordName: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const chordTag = `[${chordName}]`;

    const newContent =
      content.substring(0, start) + chordTag + content.substring(end);

    setContent(newContent);

    // Reposition cursor right after the inserted chord tag
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + chordTag.length, start + chordTag.length);
    }, 10);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Lütfen şarkı başlığını girin.');
      return;
    }
    if (!content.trim()) {
      alert('Lütfen şarkı sözlerini ve akorlarını girin.');
      return;
    }

    setSaving(true);
    const songData = {
      title: title.trim(),
      artist: artist.trim() || null,
      content,
      strumming_pattern: strummingPattern || null,
      bpm: bpm || null,
      time_signature: timeSignature || '4/4',
      capo,
      updated_at: new Date().toISOString(),
    };

    if (isNew) {
      const { data, error } = await supabase.from('songs').insert([songData]).select().single();
      if (error) {
        alert('Kaydetme hatası: ' + error.message);
        setSaving(false);
        return;
      }
      router.push(`/songs/${data.id}`);
    } else {
      const { error } = await supabase
        .from('songs')
        .update(songData)
        .eq('id', initialSong?.id);

      if (error) {
        alert('Güncelleme hatası: ' + error.message);
        setSaving(false);
        return;
      }
      router.push(`/songs/${initialSong?.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-base sm:text-lg font-bold truncate">
              {isNew ? 'Yeni Şarkı Ekle' : 'Şarkıyı Düzenle'}
            </h1>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-black font-bold rounded-xl text-sm transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            <span>{saving ? 'Kaydediliyor...' : 'Kaydet'}</span>
          </button>
        </div>
      </header>

      {/* Mobile-Only Dedicated Segmented Tab Bar */}
      <div className="lg:hidden sticky top-14 z-20 bg-white/95 dark:bg-zinc-900/95 border-b border-zinc-200 dark:border-zinc-800 px-4 py-2.5 backdrop-blur-md">
        <div className="grid grid-cols-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-sm font-semibold">
          <button
            onClick={() => setActiveTab('editor')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'editor'
                ? 'bg-white dark:bg-zinc-900 text-amber-500 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Edit className="w-4 h-4" />
            <span>Editör</span>
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-white dark:bg-zinc-900 text-amber-500 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Canlı Önizleme</span>
          </button>
        </div>
      </div>

      {/* Main Container - Split View on Desktop */}
      <div className="max-w-7xl mx-auto w-full px-4 py-6 flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN: Input Form & Editor */}
        <div
          className={`space-y-5 flex-col ${
            activeTab === 'editor' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Metadata Cards */}
          <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">
                  Şarkı Adı *
                </label>
                <input
                  type="text"
                  placeholder="Örn: Akdeniz Akşamları"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">
                  Sanatçı
                </label>
                <input
                  type="text"
                  placeholder="Örn: Haluk Levent"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Rhythm & BPM Settings */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">
                  Kapo (Perde)
                </label>
                <select
                  value={capo}
                  onChange={(e) => setCapo(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value={0}>Kapo Yok</option>
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <option key={num} value={num}>
                      {num}. Perde
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">
                  Tempo (BPM)
                </label>
                <input
                  type="number"
                  value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value))}
                  min={40}
                  max={240}
                  className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-semibold text-zinc-500 mb-1">
                  Ritim Kalıbı
                </label>
                <input
                  type="text"
                  placeholder="Örn: A-AY-YA-Y veya ↓ ↓↑ ↑↓↑"
                  value={strummingPattern}
                  onChange={(e) => setStrummingPattern(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Quick Presets for rhythm */}
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-[11px] text-zinc-400 mr-1">Hızlı Seçim:</span>
              {RHYTHM_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setStrummingPattern(preset.pattern)}
                  className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded text-xs transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile-Only Live Preview Card (Right Above Editor) */}
          <div className="lg:hidden p-3.5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-500">
              <span className="flex items-center gap-1.5 text-amber-500 font-bold">
                <Eye className="w-4 h-4" />
                Anlık Canlı Önizleme
              </span>
              <span className="text-[11px] text-zinc-400">
                Aşağıda yazdıkça burada canlanır
              </span>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100 dark:border-zinc-800/80 max-h-52 overflow-y-auto">
              {content.trim() ? (
                <ChordSheet content={content} fontSize="sm" />
              ) : (
                <p className="text-xs text-zinc-400 text-center py-4">
                  Aşağıdaki kutuya söz ve akor yazdıkça canlı hali burada belirecek.
                </p>
              )}
            </div>
          </div>

          {/* Quick Chord Insertion Bar */}
          <div className="p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span className="font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Hızlı Akor Ekle (İmlecin olduğu yere ekler)
              </span>
              <span className="hidden sm:inline text-zinc-400">
                Kelimenin tam hecesinin önüne tıklayıp butona bas
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 items-center">
              {COMMON_CHORDS_BAR.map((chord) => (
                <button
                  key={chord}
                  type="button"
                  onClick={() => insertChord(chord)}
                  className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500 hover:text-black text-amber-600 dark:text-amber-400 font-bold rounded-lg text-xs border border-amber-500/20 transition-all cursor-pointer"
                >
                  +{chord}
                </button>
              ))}

              {/* Custom Chord input */}
              <div className="flex items-center gap-1 ml-auto">
                <input
                  type="text"
                  placeholder="Akor..."
                  value={customChord}
                  onChange={(e) => setCustomChord(e.target.value)}
                  className="w-16 px-2 py-1 text-xs bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customChord) {
                      insertChord(customChord.trim());
                      setCustomChord('');
                    }
                  }}
                  className="p-1 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 rounded-lg text-xs"
                  title="Özel akor ekle"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Lyrics + Chords Textarea */}
          <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Şarkı Sözleri ve Akorlar (ChordPro Formatı)
              </label>
              <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                <HelpCircle className="w-3 h-3" />
                <span>Örn: [Am]Akdeniz ak[Em]şamları...</span>
              </div>
            </div>

            <textarea
              ref={textareaRef}
              rows={14}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Şarkı sözlerini buraya yapıştırın. Akor eklemek istediğiniz hecenin önüne [Am] veya yukarıdaki akor butonlarına basarak ekleyebilirsiniz."
              className="w-full flex-1 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500 resize-y"
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Live Interactive Preview */}
        <div
          className={`space-y-4 flex-col ${
            activeTab === 'preview' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-amber-500" />
              Canlı Önizleme (Telefonda görünecek hal)
            </span>
            <span className="text-xs text-zinc-400">
              Masaüstünde yazdığın an burada canlanır
            </span>
          </div>

          {/* Strumming pattern preview */}
          <StrummingPattern
            pattern={strummingPattern}
            bpm={bpm}
            timeSignature={timeSignature}
            capo={capo}
          />

          {/* Live Chord Sheet Preview */}
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm min-h-[400px]">
            {title && (
              <div className="mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <h2 className="text-xl font-bold">{title}</h2>
                {artist && <p className="text-sm text-zinc-400">{artist}</p>}
              </div>
            )}

            {content.trim() ? (
              <ChordSheet content={content} />
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-zinc-400 text-sm">
                <span>Soldaki editöre söz ve akor girdikçe</span>
                <span>önizleme anında burada belirecek.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
