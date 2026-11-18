import React, { useState } from 'react';
import { Plus, RotateCcw, X } from 'lucide-react';
import type { BrandBookData, DocumentLanguage } from '../../shared/types.ts';
import { getDefaultSectionCopy } from '../../shared/brandbook/sections.ts';

interface Props {
  brand: BrandBookData;
  onChange: (updater: (prev: BrandBookData) => BrandBookData) => void;
  onLoadDemo: () => void;
}

const SECTORS = [
  'Architecture & Urbanisme',
  'Technologie & SaaS',
  'Conseil & Finance',
  'Mode, Luxe & Artisanat',
  'Santé & Biotechnologie',
  'Culture, Édition & Médias',
  'Industrie & Énergie',
  'Gastronomie & Hôtellerie',
];

export function Step1Brand({ brand, onChange, onLoadDemo }: Props) {
  const [newValue, setNewValue] = useState('');

  const addValue = () => {
    const trimmed = newValue.trim();
    if (!trimmed || brand.values.length >= 5) return;
    if (brand.values.includes(trimmed)) {
      setNewValue('');
      return;
    }
    onChange((prev) => ({ ...prev, values: [...prev.values, trimmed] }));
    setNewValue('');
  };

  const removeValue = (val: string) => {
    onChange((prev) => ({
      ...prev,
      values: prev.values.filter((v) => v !== val),
    }));
  };

  const handleLanguageChange = (language: DocumentLanguage) => {
    onChange((prev) => ({
      ...prev,
      language,
      guideline: {
        ...prev.guideline,
        sectionCopy: getDefaultSectionCopy(language),
      },
    }));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            01. Identité fondamentale de la marque
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Renseignez les éléments rédactionnels qui structureront la couverture, l’identité et les textes d’introduction.
          </p>
        </div>
        <button
          type="button"
          onClick={onLoadDemo}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Charger l’exemple Aurelia Atelier
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-7">
          <div>
            <label htmlFor="brand-name" className="block text-sm font-medium text-slate-800">
              Nom de la marque *
            </label>
            <input
              id="brand-name"
              type="text"
              value={brand.name}
              onChange={(e) => onChange((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Ex : Aurelia Atelier"
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="brand-baseline" className="block text-sm font-medium text-slate-800">
              Baseline / Signature (optionnelle)
            </label>
            <input
              id="brand-baseline"
              type="text"
              value={brand.baseline}
              onChange={(e) => onChange((prev) => ({ ...prev, baseline: e.target.value }))}
              placeholder="Ex : Architecture bioclimatique & espaces durables"
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="brand-sector" className="block text-sm font-medium text-slate-800">
              Secteur d’activité
            </label>
            <input
              id="brand-sector"
              list="sector-suggestions"
              type="text"
              value={brand.sector}
              onChange={(e) => onChange((prev) => ({ ...prev, sector: e.target.value }))}
              placeholder="Sélectionnez ou saisissez un secteur"
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
            />
            <datalist id="sector-suggestions">
              {SECTORS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>

          <div>
            <label htmlFor="brand-desc" className="block text-sm font-medium text-slate-800">
              Description courte
            </label>
            <textarea
              id="brand-desc"
              rows={4}
              value={brand.description}
              onChange={(e) =>
                onChange((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Décrivez le positionnement, l’offre et l’ambition de la marque en 2 à 3 phrases."
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-800">
                Valeurs & mots-clés (3 à 5)
              </span>
              <span className="font-mono text-xs text-slate-500 tabular-nums">
                {brand.values.length} / 5
              </span>
            </div>

            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addValue();
                  }
                }}
                placeholder="Ex : Sobriété carbone"
                className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
              />
              <button
                type="button"
                onClick={addValue}
                disabled={brand.values.length >= 5 || !newValue.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-40 whitespace-nowrap shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                Ajouter
              </button>
            </div>

            <div className="mt-4 divide-y divide-slate-100 border-t border-slate-100">
              {brand.values.length === 0 ? (
                <p className="py-3 text-xs text-slate-500">
                  Ajoutez entre 3 et 5 valeurs directrices pour alimenter la page Identité et la rédaction IA.
                </p>
              ) : (
                brand.values.map((val, i) => (
                  <div
                    key={val}
                    className="flex items-center justify-between py-2.5 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-slate-400 tabular-nums">
                        0{i + 1}
                      </span>
                      <span className="font-medium text-slate-800">{val}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeValue(val)}
                      aria-label={`Supprimer ${val}`}
                      className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <span className="block text-sm font-medium text-slate-800">
              Langue du document PDF
            </span>
            <p className="mt-1 text-xs text-slate-500">
              Adapte automatiquement les intitulés des 18 chapitres, les textes par défaut et le format de date.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => handleLanguageChange('fr')}
                className={`rounded-md py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                  brand.language === 'fr'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Français
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange('en')}
                className={`rounded-md py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                  brand.language === 'en'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                English
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
