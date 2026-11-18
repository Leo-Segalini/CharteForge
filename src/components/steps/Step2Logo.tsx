import React, { useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Crop,
  Palette,
  Trash2,
  Upload,
} from 'lucide-react';
import type {
  BrandBookData,
  LogoAssetData,
  LogoVariantType,
} from '../../shared/types.ts';
import { generateSignatureGradients, normalizeHex } from '../../shared/colorEngine.ts';

interface Props {
  brand: BrandBookData;
  onChange: (updater: (prev: BrandBookData) => BrandBookData) => void;
}

const VARIANT_SLOTS: Array<{ type: LogoVariantType; label: string; hint: string }> = [
  { type: 'primary', label: 'Logo principal *', hint: 'SVG recommandé, PNG, JPG ou WebP (10 Mo max)' },
  { type: 'horizontal', label: 'Version horizontale', hint: 'En-têtes et bannières larges' },
  { type: 'vertical', label: 'Version verticale / empilée', hint: 'Carrés et formats portrait' },
  { type: 'monogram', label: 'Monogramme / Symbole seul', hint: 'Favicon, avatars et icônes' },
  { type: 'negative', label: 'Version négative (fond sombre)', hint: 'Optionnelle — sinon générée en blanc' },
];

export function Step2Logo({ brand, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeSlot, setActiveSlot] = useState<LogoVariantType>('primary');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [suggestedColors, setSuggestedColors] = useState<string[]>([]);

  // Monogram crop parameters (percentages)
  const [cropRect, setCropRect] = useState({ x: 0, y: 0, width: 32, height: 100 });
  const [cropping, setCropping] = useState(false);

  const primaryLogo = brand.logos.find((l) => l.variantType === 'primary');

  const handleFileUpload = async (file: File, variantType: LogoVariantType) => {
    setUploadError(null);
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Le fichier dépasse la limite maximale de 10 Mo.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('variantType', variantType);

      const res = await fetch('/api/upload/logo', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Échec lors du traitement du logo.');
      }

      const incoming: LogoAssetData[] = [
        data.primary as LogoAssetData,
        ...((data.generatedVariants as LogoAssetData[]) ?? []),
      ];

      onChange((prev) => {
        const replacedTypes = new Set(incoming.map((i) => i.variantType));
        const kept = prev.logos.filter((l) => !replacedTypes.has(l.variantType));
        return {
          ...prev,
          logos: [...kept, ...incoming],
        };
      });

      if (Array.isArray(data.suggestedPalette) && data.suggestedPalette.length > 0) {
        setSuggestedColors(data.suggestedPalette);
      }
    } catch (err: unknown) {
      setUploadError(
        err instanceof Error ? err.message : 'Impossible d’analyser ce logo.'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent, slot: LogoVariantType) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void handleFileUpload(file, slot);
    }
  };

  const handleCropMonogram = async () => {
    if (!primaryLogo) return;
    setCropping(true);
    setUploadError(null);
    try {
      const res = await fetch('/api/upload/logo-crop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataUrl: primaryLogo.dataUrl,
          crop: cropRect,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Impossible de recadrer le monogramme.');
      }
      const mono = data.monogram as LogoAssetData;
      onChange((prev) => ({
        ...prev,
        logos: [...prev.logos.filter((l) => l.variantType !== 'monogram'), mono],
      }));
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Erreur de recadrage.');
    } finally {
      setCropping(false);
    }
  };

  const applySuggestedPalette = () => {
    if (suggestedColors.length === 0) return;
    const roles = ['primary', 'secondary', 'accent'];
    onChange((prev) => {
      const updated = prev.colors.map((c) => {
        const roleIdx = roles.indexOf(c.role);
        if (roleIdx !== -1 && suggestedColors[roleIdx]) {
          return { ...c, hex: normalizeHex(suggestedColors[roleIdx]) };
        }
        return c;
      });
      return {
        ...prev,
        colors: updated,
        gradients: generateSignatureGradients(updated),
      };
    });
  };

  const removeVariant = (variantType: LogoVariantType) => {
    onChange((prev) => ({
      ...prev,
      logos: prev.logos.filter((l) => l.variantType !== variantType),
    }));
  };

  const generatedVariants = brand.logos.filter((l) =>
    ['mono_dark', 'mono_light', 'no_baseline'].includes(l.variantType)
  );

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-xl font-semibold text-slate-900">
          02. Logotype, variantes & analyse qualité
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Importez votre logo (SVG vectoriel recommandé). Les scripts éventuels sont nettoyés automatiquement et les déclinaisons manquantes sont générées.
        </p>
      </div>

      {uploadError && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Primary Dropzone + Variant Slots */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-7">
          <div className="flex flex-wrap gap-2">
            {VARIANT_SLOTS.map((slot) => {
              const hasLogo = brand.logos.some((l) => l.variantType === slot.type);
              return (
                <button
                  key={slot.type}
                  type="button"
                  onClick={() => setActiveSlot(slot.type)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                    activeSlot === slot.type
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : hasLogo
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {slot.label}
                </button>
              );
            })}
          </div>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, activeSlot)}
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white px-6 py-10 text-center transition-colors hover:border-slate-500"
          >
            <Upload className="h-7 w-7 text-slate-500" />
            <p className="mt-3 text-sm font-medium text-slate-900">
              Glissez-déposez votre fichier pour «{' '}
              {VARIANT_SLOTS.find((s) => s.type === activeSlot)?.label} »
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {VARIANT_SLOTS.find((s) => s.type === activeSlot)?.hint}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".svg,.png,.jpg,.jpeg,.webp,image/svg+xml,image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  void handleFileUpload(file, activeSlot);
                }
                e.target.value = '';
              }}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {uploading ? 'Analyse & nettoyage en cours…' : 'Parcourir les fichiers'}
            </button>
          </div>

          {/* Quality Audit of uploaded logos */}
          <div className="space-y-3">
            {brand.logos
              .filter((l) => l.origin === 'uploaded')
              .map((logo) => (
                <div
                  key={logo.variantType}
                  className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex h-14 w-24 shrink-0 items-center justify-center rounded border border-slate-200 bg-slate-50 p-2">
                      <img
                        src={logo.dataUrl}
                        alt={logo.variantType}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                        <span>{logo.variantType}</span>
                        <span className="text-slate-300">·</span>
                        <span className="font-mono text-xs text-slate-500 tabular-nums">
                          {logo.width}×{logo.height}px
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs text-slate-500">
                          {logo.hasTransparency ? 'Fond transparent' : 'Fond opaque'}
                        </span>
                      </div>
                      {logo.qualityWarnings.length > 0 ? (
                        <p className="mt-1 text-xs text-amber-700">
                          {logo.qualityWarnings.join(' ')}
                        </p>
                      ) : (
                        <p className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Qualité validée pour impression & numérique
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVariant(logo.variantType)}
                    aria-label="Supprimer cette variante"
                    className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* Right column: Auto-generated variants, Monogram Cropper, Suggested Palette */}
        <div className="space-y-5 lg:col-span-5">
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-900">
              Variantes générées automatiquement
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Recoloration vectorielle ou masque alpha calculés depuis votre logo principal.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {generatedVariants.length === 0 ? (
                <p className="col-span-2 text-xs text-slate-500">
                  Importez un logo principal pour générer les déclinaisons monochrome noir, monochrome blanc et sans baseline.
                </p>
              ) : (
                generatedVariants.map((v) => {
                  const isLight = v.variantType === 'mono_light';
                  return (
                    <div
                      key={v.variantType}
                      className="rounded border border-slate-200 p-2.5"
                    >
                      <div
                        className={`flex h-16 items-center justify-center rounded p-2 ${
                          isLight ? 'bg-slate-900' : 'bg-slate-50'
                        }`}
                      >
                        <img
                          src={v.dataUrl}
                          alt={v.variantType}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div className="mt-2 text-xs font-medium text-slate-700">
                        {v.variantType === 'mono_dark'
                          ? 'Monochrome noir'
                          : v.variantType === 'mono_light'
                            ? 'Monochrome blanc'
                            : 'Sans baseline'}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {primaryLogo && (
            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">
                  Extraire le monogramme (recadrage)
                </h3>
                <Crop className="h-4 w-4 text-slate-500" />
              </div>
              <div className="mt-3 relative mx-auto flex h-28 w-full items-center justify-center overflow-hidden rounded border border-slate-200 bg-slate-50 p-3">
                <div className="relative inline-block max-h-full">
                  <img
                    src={primaryLogo.dataUrl}
                    alt="Zone de recadrage"
                    className="max-h-20 object-contain"
                  />
                  <div
                    className="pointer-events-none absolute border-2 border-amber-600 bg-amber-500/15"
                    style={{
                      left: `${cropRect.x}%`,
                      top: `${cropRect.y}%`,
                      width: `${cropRect.width}%`,
                      height: `${cropRect.height}%`,
                    }}
                  />
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <label className="flex flex-col gap-1 text-slate-600">
                  Position X ({cropRect.x}%)
                  <input
                    type="range"
                    min={0}
                    max={80}
                    value={cropRect.x}
                    onChange={(e) =>
                      setCropRect((r) => ({ ...r, x: Number(e.target.value) }))
                    }
                  />
                </label>
                <label className="flex flex-col gap-1 text-slate-600">
                  Largeur ({cropRect.width}%)
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={cropRect.width}
                    onChange={(e) =>
                      setCropRect((r) => ({ ...r, width: Number(e.target.value) }))
                    }
                  />
                </label>
              </div>
              <button
                type="button"
                disabled={cropping}
                onClick={handleCropMonogram}
                className="mt-3 w-full rounded-lg border border-slate-200 bg-white py-2 text-xs font-medium text-slate-800 hover:bg-slate-50"
              >
                {cropping ? 'Extraction…' : 'Générer le monogramme recadré'}
              </button>
            </div>
          )}

          {suggestedColors.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">
                  Couleurs extraites du logo
                </h3>
                <Palette className="h-4 w-4 text-slate-500" />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {suggestedColors.map((hex) => (
                  <div
                    key={hex}
                    className="flex items-center gap-2 rounded border border-slate-200 px-2.5 py-1.5"
                  >
                    <span
                      className="h-4 w-4 rounded-xs border border-slate-200"
                      style={{ backgroundColor: hex }}
                    />
                    <span className="font-mono text-xs text-slate-700">{hex}</span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={applySuggestedPalette}
                className="mt-3 w-full rounded-lg bg-slate-900 py-2 text-xs font-medium text-white hover:bg-slate-800"
              >
                Appliquer à la palette (Primaire / Secondaire / Accent)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
