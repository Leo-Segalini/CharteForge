import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import type {
  BrandBookData,
  DocumentFormat,
  LayoutTemplate,
  SectionId,
} from '../../shared/types.ts';
import { ALL_SECTIONS } from '../../shared/brandbook/sections.ts';

interface Props {
  brand: BrandBookData;
  onChange: (updater: (prev: BrandBookData) => BrandBookData) => void;
}

const TEMPLATES: Array<{ id: LayoutTemplate; name: string; desc: string }> = [
  {
    id: 'classic',
    name: 'Classique',
    desc: 'Cartes structurées et filets nets, idéal pour les chartes institutionnelles.',
  },
  {
    id: 'editorial',
    name: 'Éditorial',
    desc: 'Grands titres, respiration généreuse et approche magazine.',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    desc: 'Esthétique sobre noir & blanc réhaussée d’une unique couleur d’accent.',
  },
];

export function Step5ContentStyle({ brand, onChange }: Props) {
  const [selectedSection, setSelectedSection] = useState<SectionId>('identity');
  const [generatingId, setGeneratingId] = useState<SectionId | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const toggleSection = (id: SectionId) => {
    onChange((prev) => {
      const exists = prev.guideline.enabledSections.includes(id);
      const next = exists
        ? prev.guideline.enabledSections.filter((s) => s !== id)
        : ALL_SECTIONS.map((s) => s.id).filter(
            (s) => s === id || prev.guideline.enabledSections.includes(s)
          );
      return {
        ...prev,
        guideline: { ...prev.guideline, enabledSections: next },
      };
    });
  };

  const setFormat = (format: DocumentFormat) => {
    onChange((prev) => ({
      ...prev,
      guideline: { ...prev.guideline, format },
    }));
  };

  const setTemplate = (template: LayoutTemplate) => {
    onChange((prev) => ({
      ...prev,
      guideline: { ...prev.guideline, template },
    }));
  };

  const updateSectionCopy = (id: SectionId, text: string) => {
    onChange((prev) => ({
      ...prev,
      guideline: {
        ...prev.guideline,
        sectionCopy: {
          ...prev.guideline.sectionCopy,
          [id]: text,
        },
      },
    }));
  };

  const handleGenerateAiCopy = async (id: SectionId) => {
    setGeneratingId(id);
    setAiError(null);
    try {
      const res = await fetch('/api/ai/section-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: brand.name,
          sector: brand.sector,
          baseline: brand.baseline,
          description: brand.description,
          values: brand.values,
          language: brand.language,
          sectionId: id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Échec de la rédaction IA.');
      }
      updateSectionCopy(id, data.copy);
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : 'Erreur IA.');
    } finally {
      setGeneratingId(null);
    }
  };

  const activeDef = ALL_SECTIONS.find((s) => s.id === selectedSection);

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-xl font-semibold text-slate-900">
          05. Contenu, mise en page & rédaction assistée
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Sélectionnez les chapitres à inclure, le format A4, le modèle graphique et personnalisez les textes d’introduction.
        </p>
      </div>

      {/* Format & Layout Template */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-lg border border-slate-200 bg-white p-5 lg:col-span-4">
          <h3 className="text-sm font-semibold text-slate-900">Format du document</h3>
          <div className="mt-3 space-y-2">
            <button
              type="button"
              onClick={() => setFormat('landscape')}
              className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                brand.guideline.format === 'landscape'
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
              }`}
            >
              <span>A4 Paysage (recommandé)</span>
              <span className="font-mono text-xs opacity-75">297×210mm</span>
            </button>
            <button
              type="button"
              onClick={() => setFormat('portrait')}
              className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                brand.guideline.format === 'portrait'
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
              }`}
            >
              <span>A4 Portrait</span>
              <span className="font-mono text-xs opacity-75">210×297mm</span>
            </button>
          </div>

          <h3 className="mt-6 text-sm font-semibold text-slate-900">
            Paramètres système & protection
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <label className="text-slate-600">
              Colonnes grille
              <input
                type="number"
                min={4}
                max={16}
                value={brand.gridConfig.columns}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    gridConfig: {
                      ...prev.gridConfig,
                      columns: Number(e.target.value) || 12,
                    },
                  }))
                }
                className="mt-1 w-full rounded border border-slate-200 px-2.5 py-1.5 font-mono"
              />
            </label>
            <label className="text-slate-600">
              Rayon cartes (px)
              <input
                type="number"
                min={0}
                max={24}
                value={brand.gridConfig.radiusMdPx}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    gridConfig: {
                      ...prev.gridConfig,
                      radiusMdPx: Number(e.target.value) || 8,
                    },
                  }))
                }
                className="mt-1 w-full rounded border border-slate-200 px-2.5 py-1.5 font-mono"
              />
            </label>
            <label className="text-slate-600">
              Marge logo (× X)
              <input
                type="number"
                step={0.25}
                min={0.25}
                max={2}
                value={brand.protectionConfig.marginMultiplier}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    protectionConfig: {
                      ...prev.protectionConfig,
                      marginMultiplier: Number(e.target.value) || 0.5,
                    },
                  }))
                }
                className="mt-1 w-full rounded border border-slate-200 px-2.5 py-1.5 font-mono"
              />
            </label>
            <label className="text-slate-600">
              Trait icônes (px)
              <input
                type="number"
                step={0.25}
                min={1}
                max={3}
                value={brand.iconConfig.strokeWidth}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    iconConfig: {
                      ...prev.iconConfig,
                      strokeWidth: Number(e.target.value) || 1.75,
                    },
                  }))
                }
                className="mt-1 w-full rounded border border-slate-200 px-2.5 py-1.5 font-mono"
              />
            </label>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 lg:col-span-8">
          <h3 className="text-sm font-semibold text-slate-900">
            Modèle de mise en page
          </h3>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setTemplate(tpl.id)}
                className={`flex flex-col justify-between rounded-lg border p-4 text-left transition-colors ${
                  brand.guideline.template === tpl.id
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="text-sm font-semibold">{tpl.name}</span>
                <span
                  className={`mt-2 text-xs leading-relaxed ${
                    brand.guideline.template === tpl.id
                      ? 'text-slate-200'
                      : 'text-slate-500'
                  }`}
                >
                  {tpl.desc}
                </span>
              </button>
            ))}
          </div>

          <h3 className="mt-6 text-sm font-semibold text-slate-900">
            Sections incluses ({brand.guideline.enabledSections.length} / {ALL_SECTIONS.length})
          </h3>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
            {ALL_SECTIONS.map((sec, idx) => {
              const checked = brand.guideline.enabledSections.includes(sec.id);
              return (
                <div
                  key={sec.id}
                  className={`flex items-center justify-between rounded border px-3 py-2 text-xs ${
                    selectedSection === sec.id
                      ? 'border-slate-900 bg-slate-50'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <label className="flex items-center gap-2 cursor-pointer min-w-0">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSection(sec.id)}
                      className="rounded border-slate-300"
                    />
                    <span className="truncate font-medium text-slate-800">
                      {String(idx + 1).padStart(2, '0')}.{' '}
                      {brand.language === 'en' ? sec.titleEn : sec.titleFr}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setSelectedSection(sec.id)}
                    className="ml-2 text-slate-500 hover:text-slate-900 shrink-0"
                  >
                    Éditer
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Section Intro Copy Editor + AI */}
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Texte d’introduction :{' '}
              {brand.language === 'en' ? activeDef?.titleEn : activeDef?.titleFr}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Modifiez le chapeau éditorial de cette page ou générez une proposition adaptée à votre secteur.
            </p>
          </div>
          <button
            type="button"
            disabled={generatingId === selectedSection}
            onClick={() => handleGenerateAiCopy(selectedSection)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50 whitespace-nowrap shrink-0"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {generatingId === selectedSection
              ? 'Rédaction en cours…'
              : 'Rédiger avec l’IA'}
          </button>
        </div>

        {aiError && (
          <p className="mt-2 text-xs text-red-700">{aiError}</p>
        )}

        <textarea
          rows={3}
          value={brand.guideline.sectionCopy[selectedSection] ?? ''}
          onChange={(e) => updateSectionCopy(selectedSection, e.target.value)}
          className="mt-3 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
        />
      </div>
    </div>
  );
}
