import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Upload } from 'lucide-react';
import type {
  BrandBookData,
  FontAssetData,
  FontRole,
  TypeScalePreset,
} from '../../shared/types.ts';
import { buildTypeScalePreset } from '../../shared/brandbook/sections.ts';
import {
  GOOGLE_FONTS_CATALOG,
  guessFallback,
  type GoogleFontEntry,
} from '../../shared/googleFontsCatalog.ts';
import { GoogleFontPicker } from '../GoogleFontPicker.tsx';

interface Props {
  brand: BrandBookData;
  onChange: (updater: (prev: BrandBookData) => BrandBookData) => void;
}

const ROLE_LABELS: Record<FontRole, string> = {
  heading: 'Titres (H1–H3)',
  body: 'Corps de texte',
  mono: 'Chiffres & Code',
};

export function Step4Fonts({ brand, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [targetRole, setTargetRole] = useState<FontRole>('heading');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dynamically load selected Google fonts in browser so specimens render live
  useEffect(() => {
    const googleFams = brand.fonts
      .filter((f) => f.source === 'google')
      .map((f) => f.family);
    if (googleFams.length === 0) return;
    const id = 'charteforge-dynamic-gfonts';
    let link = document.getElementById(id) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    const query = Array.from(new Set(googleFams))
      .map((f) => `family=${encodeURIComponent(f)}:wght@400;500;600;700`)
      .join('&');
    link.href = `https://fonts.googleapis.com/css2?${query}&display=swap`;
  }, [brand.fonts]);

  const handleUploadFont = async (file: File) => {
    setError(null);
    if (file.size > 10 * 1024 * 1024) {
      setError('La taille maximale par fichier de police est de 10 Mo.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('role', targetRole);
      const res = await fetch('/api/upload/font', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Échec de l’analyse de la police.');
      }
      const parsed = data.font as FontAssetData;
      onChange((prev) => ({
        ...prev,
        fonts: [...prev.fonts.filter((f) => f.role !== targetRole), parsed],
      }));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur d’importation.');
    } finally {
      setUploading(false);
    }
  };

  const assignGoogleFont = (role: FontRole, family: string, entry?: GoogleFontEntry) => {
    const cat = entry ?? GOOGLE_FONTS_CATALOG.find((g) => g.family === family);
    onChange((prev) => ({
      ...prev,
      fonts: [
        ...prev.fonts.filter((f) => f.role !== role),
        {
          family,
          role,
          source: 'google',
          weights: cat?.weights ?? ['400', '600', '700'],
          fallback: guessFallback(family, role),
          coverage: {
            frenchAccents: true,
            euroSymbol: true,
            frenchQuotes: true,
            tabularDigits: role === 'mono',
            glyphCount: 600,
            isVariable: true,
            variableAxes: ['wght'],
          },
          rightsConfirmed: true,
        },
      ],
    }));
  };

  const toggleAllRights = (checked: boolean) => {
    onChange((prev) => ({
      ...prev,
      fonts: prev.fonts.map((f) => ({ ...f, rightsConfirmed: checked })),
    }));
  };

  const updateScalePreset = (preset: TypeScalePreset) => {
    onChange((prev) => ({
      ...prev,
      typeScale: buildTypeScalePreset(preset),
    }));
  };

  const updateLevel = (
    idx: number,
    patch: Partial<{ sizePx: number; lineHeight: number; weight: string }>
  ) => {
    onChange((prev) => ({
      ...prev,
      typeScale: {
        ...prev.typeScale,
        levels: prev.typeScale.levels.map((lvl, i) =>
          i === idx ? { ...lvl, ...patch } : lvl
        ),
      },
    }));
  };

  const hasUnconfirmedUploads = brand.fonts.some(
    (f) => f.source === 'upload' && !f.rightsConfirmed
  );

  // Inject @font-face for uploaded WOFF2 in browser specimens
  const uploadedFaceCss = brand.fonts
    .filter((f) => f.source === 'upload' && f.woff2DataUrl)
    .map(
      (f) =>
        `@font-face { font-family: '${f.family.replace(/'/g, '')}'; src: url('${f.woff2DataUrl}'); font-display: swap; }`
    )
    .join('\n');

  return (
    <div className="space-y-8">
      {uploadedFaceCss && <style>{uploadedFaceCss}</style>}

      <div className="border-b border-border-hairline pb-5">
        <h2 className="text-xl font-semibold text-text-primary">
          04. Polices typographiques & échelle de corps
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Importez vos fichiers TTF, OTF, WOFF ou WOFF2, ou recherchez parmi {GOOGLE_FONTS_CATALOG.length} Google Fonts avec aperçu live.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload + Google Fonts Selector */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-5">
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-900">
              Importer une police personnalisée
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Formats acceptés : TTF, OTF, WOFF, WOFF2 (10 Mo max). Les fichiers restent strictement privés à votre espace.
            </p>

            <div className="mt-4">
              <span className="block text-xs font-medium text-slate-700">
                Rôle attribué
              </span>
              <div className="mt-1.5 grid grid-cols-3 gap-1.5 rounded-lg bg-slate-100 p-1">
                {(['heading', 'body', 'mono'] as FontRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setTargetRole(r)}
                    className={`rounded-md py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                      targetRole === r
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {r === 'heading' ? 'Titres' : r === 'body' ? 'Corps' : 'Chiffres'}
                  </button>
                ))}
              </div>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept=".ttf,.otf,.woff,.woff2"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleUploadFont(file);
                e.target.value = '';
              }}
            />

            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 py-5 text-xs font-medium text-slate-700 hover:border-slate-500 hover:bg-slate-50"
            >
              <Upload className="h-4 w-4" />
              {uploading
                ? 'Analyse opentype & compression WOFF2…'
                : 'Importer un fichier TTF / OTF / WOFF / WOFF2'}
            </button>

            <label className="mt-4 flex items-start gap-2.5 text-xs text-slate-700">
              <input
                type="checkbox"
                checked={!hasUnconfirmedUploads}
                onChange={(e) => toggleAllRights(e.target.checked)}
                className="mt-0.5 rounded border-slate-300"
              />
              <span>
                Je confirme disposer des droits d’utilisation et d’embarquement PDF de ces polices.
              </span>
            </label>
          </div>
        </div>

        {/* Assigned roles cards */}
        <div className="space-y-4 lg:col-span-7">
          {(['heading', 'body', 'mono'] as FontRole[]).map((role) => {
            const assigned = brand.fonts.find((f) => f.role === role);
            return (
              <div
                key={role}
                className="rounded-lg border border-slate-200 bg-white p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-medium text-slate-500">
                      {ROLE_LABELS[role]}
                    </div>
                    <div className="mt-0.5 text-base font-semibold text-slate-900">
                      {assigned?.family ?? 'Non définie'}
                    </div>
                  </div>
                  <GoogleFontPicker
                    roleLabel={ROLE_LABELS[role]}
                    roleHint={role}
                    selectedFamily={
                      assigned?.source === 'google' ? assigned.family : undefined
                    }
                    onSelect={(family, entry) => assignGoogleFont(role, family, entry)}
                  />
                </div>

                {assigned && (
                  <>
                    <div
                      className="mt-3 rounded border border-slate-100 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800"
                      style={{
                        fontFamily: `'${assigned.family}', ${assigned.fallback}`,
                      }}
                    >
                      Voix ambiguë d’un cœur qui, au zéphyr, préfère les jattes de kiwis — 1 250,00 € « Officiel »
                    </div>
                    <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-slate-500 tabular-nums">
                      <span>
                        Source : {assigned.source === 'upload' ? 'Fichier importé (WOFF2)' : 'Google Fonts'}
                      </span>
                      <span>·</span>
                      <span>Graisses : {assigned.weights.join(', ')}</span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">
                        {assigned.coverage.frenchAccents ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                        )}
                        Accents FR & € « »
                      </span>
                      {assigned.coverage.isVariable && (
                        <>
                          <span>·</span>
                          <span>Variable ({assigned.coverage.variableAxes.join(', ')})</span>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Type Scale Table */}
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Échelle typographique
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Choisissez un préréglage ou ajustez librement les tailles, graisses et interlignes.
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
            {([
              { id: 'compact', label: 'Compacte' },
              { id: 'balanced', label: 'Équilibrée' },
              { id: 'airy', label: 'Aérée' },
            ] as Array<{ id: TypeScalePreset; label: string }>).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => updateScalePreset(p.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  brand.typeScale.preset === p.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs text-slate-500">
              <tr>
                <th className="py-2.5 pr-4 font-medium">Niveau</th>
                <th className="py-2.5 pr-4 font-medium">Taille (px)</th>
                <th className="py-2.5 pr-4 font-medium">Interligne</th>
                <th className="py-2.5 pr-4 font-medium">Graisse</th>
                <th className="py-2.5 font-medium">Rendu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {brand.typeScale.levels.map((lvl, idx) => {
                const f = brand.fonts.find((item) => item.role === lvl.role);
                return (
                  <tr key={lvl.key}>
                    <td className="py-3 pr-4 font-medium text-slate-800">{lvl.label}</td>
                    <td className="py-3 pr-4">
                      <input
                        type="number"
                        min={9}
                        max={72}
                        value={lvl.sizePx}
                        onChange={(e) =>
                          updateLevel(idx, { sizePx: Number(e.target.value) || 14 })
                        }
                        className="w-20 rounded border border-slate-200 px-2 py-1 font-mono text-xs"
                      />
                    </td>
                    <td className="py-3 pr-4">
                      <input
                        type="number"
                        step={0.05}
                        min={0.9}
                        max={2.4}
                        value={lvl.lineHeight}
                        onChange={(e) =>
                          updateLevel(idx, {
                            lineHeight: Number(e.target.value) || 1.4,
                          })
                        }
                        className="w-20 rounded border border-slate-200 px-2 py-1 font-mono text-xs"
                      />
                    </td>
                    <td className="py-3 pr-4">
                      <select
                        value={lvl.weight}
                        onChange={(e) => updateLevel(idx, { weight: e.target.value })}
                        className="rounded border border-slate-200 bg-white px-2 py-1 font-mono text-xs"
                      >
                        <option value="400">400</option>
                        <option value="500">500</option>
                        <option value="600">600</option>
                        <option value="700">700</option>
                      </select>
                    </td>
                    <td className="py-3">
                      <span
                        className="block truncate max-w-md text-slate-900"
                        style={{
                          fontFamily: f ? `'${f.family}', ${f.fallback}` : undefined,
                          fontSize: `${Math.min(lvl.sizePx, 28)}px`,
                          fontWeight: Number(lvl.weight),
                          lineHeight: lvl.lineHeight,
                        }}
                      >
                        {brand.name} — Exemple {lvl.key.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
