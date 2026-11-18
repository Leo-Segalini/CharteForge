import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, Search, X } from 'lucide-react';
import {
  type GoogleFontCategory,
  type GoogleFontEntry,
  searchGoogleFonts,
} from '../shared/googleFontsCatalog.ts';
import { cn } from '../lib/cn.ts';

interface GoogleFontPickerProps {
  roleLabel: string;
  roleHint: 'heading' | 'body' | 'mono';
  selectedFamily?: string;
  onSelect: (family: string, entry: GoogleFontEntry) => void;
}

const CATEGORIES: Array<{ id: GoogleFontCategory | 'all'; label: string }> = [
  { id: 'all', label: 'Toutes' },
  { id: 'Sans', label: 'Sans' },
  { id: 'Serif', label: 'Serif' },
  { id: 'Display', label: 'Display' },
  { id: 'Mono', label: 'Mono' },
  { id: 'Handwriting', label: 'Script' },
];

export function GoogleFontPicker({
  roleLabel,
  roleHint,
  selectedFamily,
  onSelect,
}: GoogleFontPickerProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<GoogleFontCategory | 'all'>('all');
  const [activeIndex, setActiveIndex] = useState(0);

  const results = useMemo(
    () => searchGoogleFonts(query, { category, roleHint }),
    [query, category, roleHint],
  );

  // Précharge les familles visibles pour l’aperçu
  useEffect(() => {
    if (!open) return;
    const preview = results.slice(0, 24).map((f) => f.family);
    if (selectedFamily && !preview.includes(selectedFamily)) {
      preview.unshift(selectedFamily);
    }
    if (preview.length === 0) return;
    const id = 'charteforge-gfont-picker-preview';
    let link = document.getElementById(id) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    const queryParam = Array.from(new Set(preview))
      .map((f) => `family=${encodeURIComponent(f)}:wght@400;600;700`)
      .join('&');
    link.href = `https://fonts.googleapis.com/css2?${queryParam}&display=swap`;
  }, [open, results, selectedFamily]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, category]);

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const choose = (entry: GoogleFontEntry) => {
    onSelect(entry.family, entry);
    setQuery('');
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative w-full max-w-sm">
      <label className="sr-only" htmlFor={`${listId}-search`}>
        Rechercher une Google Font pour {roleLabel}
      </label>
      <div className="flex items-center gap-2 rounded-full border border-border-hairline bg-surface-canvas px-3 py-2 focus-within:border-violet focus-within:shadow-[0_0_0_3px_rgba(101,89,245,0.15)]">
        <Search className="h-4 w-4 shrink-0 text-text-muted" aria-hidden />
        <input
          id={`${listId}-search`}
          type="search"
          role="combobox"
          aria-expanded={open}
          aria-controls={`${listId}-listbox`}
          aria-autocomplete="list"
          autoComplete="off"
          placeholder={selectedFamily ? `Remplacer « ${selectedFamily} »…` : 'Rechercher Google Fonts…'}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
              setOpen(true);
              return;
            }
            if (e.key === 'Escape') {
              setOpen(false);
              return;
            }
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setActiveIndex((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setActiveIndex((i) => Math.max(i - 1, 0));
            } else if (e.key === 'Enter' && results[activeIndex]) {
              e.preventDefault();
              choose(results[activeIndex]);
            }
          }}
          className="min-w-0 flex-1 bg-transparent text-xs text-text-primary outline-none placeholder:text-text-muted"
        />
        {(query || open) && (
          <button
            type="button"
            aria-label="Fermer"
            onClick={() => {
              setQuery('');
              setOpen(false);
            }}
            className="rounded-full p-1 text-text-muted hover:bg-surface-muted hover:text-text-primary"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {open && (
        <div
          className="absolute right-0 z-30 mt-2 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-2xl border border-border-hairline bg-surface-canvas shadow-overlay"
          role="presentation"
        >
          <div className="flex flex-wrap gap-1 border-b border-border-subtle p-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={cn(
                  'rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors',
                  category === cat.id
                    ? 'bg-violet-soft text-violet'
                    : 'bg-surface-muted text-text-secondary hover:text-text-primary',
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <ul
            id={`${listId}-listbox`}
            role="listbox"
            aria-label={`Résultats Google Fonts pour ${roleLabel}`}
            className="max-h-72 overflow-y-auto py-1"
          >
            {results.length === 0 && (
              <li className="px-4 py-6 text-center text-xs text-text-muted">
                Aucune police pour « {query} ».
              </li>
            )}
            {results.map((font, index) => {
              const active = index === activeIndex;
              const selected = font.family === selectedFamily;
              return (
                <li key={font.family} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => choose(font)}
                    className={cn(
                      'flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors',
                      active ? 'bg-violet-soft/70' : 'hover:bg-surface-subtle',
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div
                        className="truncate text-sm font-semibold text-text-primary"
                        style={{ fontFamily: `'${font.family}', system-ui, sans-serif` }}
                      >
                        {font.family}
                      </div>
                      <div className="truncate text-[11px] text-text-muted">
                        {font.category} · {font.vibe}
                      </div>
                      <div
                        className="mt-1 truncate text-xs text-text-secondary"
                        style={{ fontFamily: `'${font.family}', system-ui, sans-serif` }}
                      >
                        Aa Bb Cc — Voix ambiguë d’un cœur
                      </div>
                    </div>
                    {selected && <Check className="h-4 w-4 shrink-0 text-violet" aria-hidden />}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-border-subtle px-3 py-2 text-[10px] text-text-muted">
            {results.length} police{results.length > 1 ? 's' : ''} · catalogue Google Fonts curaté
          </div>
        </div>
      )}
    </div>
  );
}
