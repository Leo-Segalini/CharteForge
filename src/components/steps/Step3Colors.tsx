import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Plus, Sparkles, Trash2 } from 'lucide-react';
import type { BrandBookData, ColorRole } from '../../shared/types.ts';
import {
  evaluateWcag,
  generateShades,
  generateSignatureGradients,
  getColorByRole,
  getContrastText,
  hexToCmyk,
  hexToHsl,
  hexToRgb,
  isValidHex,
  normalizeHex,
  suggestAccessibleForeground,
} from '../../shared/colorEngine.ts';

interface Props {
  brand: BrandBookData;
  onChange: (updater: (prev: BrandBookData) => BrandBookData) => void;
}

const ROLE_OPTIONS: Array<{ value: ColorRole; label: string }> = [
  { value: 'primary', label: 'Primaire' },
  { value: 'secondary', label: 'Secondaire' },
  { value: 'accent', label: 'Accent' },
  { value: 'background', label: 'Fond principal' },
  { value: 'surface', label: 'Surface / Carte' },
  { value: 'text_primary', label: 'Texte principal' },
  { value: 'text_secondary', label: 'Texte secondaire' },
  { value: 'border', label: 'Bordures' },
  { value: 'success', label: 'Succès' },
  { value: 'warning', label: 'Avertissement' },
  { value: 'error', label: 'Erreur' },
  { value: 'custom', label: 'Personnalisé' },
];

export function Step3Colors({ brand, onChange }: Props) {
  const [newName, setNewName] = useState('Couleur additionnelle');
  const [newHex, setNewHex] = useState('#2563EB');

  const updateColor = (idx: number, patch: Partial<{ name: string; role: string; hex: string }>) => {
    onChange((prev) => {
      const nextColors = prev.colors.map((c, i) => (i === idx ? { ...c, ...patch } : c));
      return {
        ...prev,
        colors: nextColors,
        gradients: generateSignatureGradients(nextColors),
      };
    });
  };

  const addColor = () => {
    if (!isValidHex(newHex)) return;
    const hex = normalizeHex(newHex);
    onChange((prev) => ({
      ...prev,
      colors: [
        ...prev.colors,
        {
          name: newName.trim() || 'Teinte personnalisée',
          role: 'custom',
          hex,
          sortOrder: prev.colors.length,
        },
      ],
    }));
  };

  const removeColor = (idx: number) => {
    onChange((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== idx),
    }));
  };

  const primary = getColorByRole(brand.colors, 'primary', '#182B49');
  const secondary = getColorByRole(brand.colors, 'secondary', '#334E68');
  const accent = getColorByRole(brand.colors, 'accent', '#C97B36');
  const bg = getColorByRole(brand.colors, 'background', '#FFFFFF');
  const surface = getColorByRole(brand.colors, 'surface', '#F8FAFC');
  const textPrimary = getColorByRole(brand.colors, 'text_primary', '#0F172A');
  const textSecondary = getColorByRole(brand.colors, 'text_secondary', '#475569');
  const border = getColorByRole(brand.colors, 'border', '#E2E8F0');

  const pairs = [
    { id: 'text-bg', label: 'Texte principal / Fond', fgRole: 'text_primary', fg: textPrimary, bg },
    { id: 'muted-bg', label: 'Texte secondaire / Fond', fgRole: 'text_secondary', fg: textSecondary, bg },
    { id: 'accent-bg', label: 'Accent / Fond', fgRole: 'accent', fg: accent, bg },
    { id: 'primary-surface', label: 'Primaire / Surface', fgRole: 'primary', fg: primary, bg: surface },
  ];

  const fixContrast = (fgRole: string, currentFg: string, targetBg: string) => {
    const fixedHex = suggestAccessibleForeground(currentFg, targetBg, 4.5);
    const idx = brand.colors.findIndex((c) => c.role === fgRole);
    if (idx !== -1) {
      updateColor(idx, { hex: fixedHex });
    }
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-xl font-semibold text-slate-900">
          03. Palette chromatique, nuances & contrôle WCAG 2.1
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Associez un rôle à chaque couleur. Les formats HEX, RGB, HSL, CMJN indicatif, les échelles 100–900 et les ratios d’accessibilité sont calculés en direct.
        </p>
      </div>

      {/* Add new color */}
      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4">
        <div>
          <label className="block text-xs font-medium text-slate-600">Nom de la teinte</label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">Couleur HEX</label>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="color"
              value={isValidHex(newHex) ? normalizeHex(newHex) : '#2563EB'}
              onChange={(e) => setNewHex(e.target.value.toUpperCase())}
              className="h-9 w-11 cursor-pointer rounded border border-slate-200 bg-white p-0.5"
            />
            <input
              type="text"
              value={newHex}
              onChange={(e) => setNewHex(e.target.value.toUpperCase())}
              className="w-28 rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={addColor}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 whitespace-nowrap shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
          Ajouter à la palette
        </button>
      </div>

      {/* Color tokens table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Teinte</th>
              <th className="px-4 py-3 font-medium">Nom</th>
              <th className="px-4 py-3 font-medium">Rôle</th>
              <th className="px-4 py-3 font-medium">HEX / RGB / CMJN</th>
              <th className="px-4 py-3 font-medium">Nuances 100–900</th>
              <th className="px-4 py-3 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {brand.colors.map((c, idx) => {
              const hex = normalizeHex(c.hex);
              const rgb = hexToRgb(hex);
              const hsl = hexToHsl(hex);
              const cmyk = hexToCmyk(hex);
              const shades = generateShades(hex);
              return (
                <tr key={`${c.role}-${idx}`} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <input
                      type="color"
                      value={hex}
                      onChange={(e) =>
                        updateColor(idx, { hex: e.target.value.toUpperCase() })
                      }
                      aria-label={`Choisir la couleur ${c.name}`}
                      className="h-8 w-10 cursor-pointer rounded border border-slate-200 bg-white p-0.5"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={c.name}
                      onChange={(e) => updateColor(idx, { name: e.target.value })}
                      className="w-40 rounded border border-slate-200 px-2.5 py-1.5 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={c.role}
                      onChange={(e) => updateColor(idx, { role: e.target.value })}
                      className="rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700"
                    >
                      {ROLE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={c.hex}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase();
                          updateColor(idx, { hex: val });
                        }}
                        className="w-24 rounded border border-slate-200 px-2 py-1 font-mono text-xs"
                      />
                      <span className="font-mono text-xs text-slate-500 tabular-nums">
                        RGB({rgb.r},{rgb.g},{rgb.b}) · HSL({hsl.h}°,{hsl.s}%,{hsl.l}%) · CMJN({cmyk.c}/{cmyk.m}/{cmyk.y}/{cmyk.k})
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex h-5 w-36 overflow-hidden rounded border border-slate-200">
                      {shades.map((s) => (
                        <div
                          key={s.step}
                          title={`${s.step}: ${s.hex}`}
                          className="flex-1"
                          style={{ backgroundColor: s.hex }}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => removeColor(idx)}
                      disabled={brand.colors.length <= 3}
                      aria-label={`Supprimer ${c.name}`}
                      className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600 disabled:opacity-30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Live WCAG Check + Live Mini UI Preview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-lg border border-slate-200 bg-white p-5 lg:col-span-6">
          <h3 className="text-sm font-semibold text-slate-900">
            Contrôle d’accessibilité WCAG 2.1 en direct
          </h3>
          <div className="mt-4 divide-y divide-slate-100">
            {pairs.map((p) => {
              const ev = evaluateWcag(p.fg, p.bg);
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 py-3 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-flex h-8 w-12 items-center justify-center rounded border border-slate-200 text-xs font-semibold"
                      style={{ backgroundColor: p.bg, color: p.fg }}
                    >
                      Aa
                    </span>
                    <div>
                      <div className="font-medium text-slate-800">{p.label}</div>
                      <div className="font-mono text-xs text-slate-500 tabular-nums">
                        {p.fg} sur {p.bg}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold tabular-nums text-slate-800">
                      {ev.ratio.toFixed(2)}:1
                    </span>
                    {ev.aaNormal ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {ev.levelLabel}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fixContrast(p.fgRole, p.fg, p.bg)}
                        className="inline-flex items-center gap-1 rounded border border-amber-300 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100 whitespace-nowrap"
                      >
                        <AlertTriangle className="h-3 w-3" />
                        Corriger ({ev.levelLabel})
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gradients + Live UI Example */}
        <div className="space-y-5 lg:col-span-6">
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">
                Dégradés signatures (modifiables)
              </h3>
              <button
                type="button"
                onClick={() =>
                  onChange((prev) => ({
                    ...prev,
                    gradients: generateSignatureGradients(prev.colors),
                  }))
                }
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Recalculer
              </button>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {brand.gradients.slice(0, 2).map((g, gIdx) => (
                <div key={g.id} className="rounded border border-slate-200 p-3">
                  <div
                    className="h-14 rounded"
                    style={{
                      background: `linear-gradient(${g.angle}deg, ${g.fromHex}, ${g.toHex})`,
                    }}
                  />
                  <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                    <span className="font-medium text-slate-800 truncate">{g.name}</span>
                    <input
                      type="number"
                      min={0}
                      max={360}
                      value={g.angle}
                      onChange={(e) => {
                        const angle = Number(e.target.value) || 135;
                        onChange((prev) => ({
                          ...prev,
                          gradients: prev.gradients.map((item, i) =>
                            i === gIdx ? { ...item, angle } : item
                          ),
                        }));
                      }}
                      className="w-16 rounded border border-slate-200 px-1.5 py-0.5 font-mono text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Interface Preview */}
          <div
            className="rounded-lg border p-5"
            style={{
              backgroundColor: bg,
              borderColor: border,
              color: textPrimary,
            }}
          >
            <div className="text-xs font-medium opacity-70">
              Aperçu temps réel sur interface client
            </div>
            <div
              className="mt-3 rounded-lg border p-4"
              style={{
                backgroundColor: surface,
                borderColor: border,
              }}
            >
              <div className="text-sm font-semibold">{brand.name} — Tableau client</div>
              <p className="mt-1 text-xs" style={{ color: textSecondary }}>
                Les contrastes et hiérarchies d’action s’ajustent instantanément.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span
                  className="rounded px-3 py-1.5 text-xs font-semibold"
                  style={{
                    backgroundColor: primary,
                    color: getContrastText(primary),
                  }}
                >
                  Bouton primaire
                </span>
                <span
                  className="rounded px-3 py-1.5 text-xs font-semibold"
                  style={{
                    backgroundColor: accent,
                    color: getContrastText(accent),
                  }}
                >
                  Action accent
                </span>
                <span
                  className="rounded border px-3 py-1.5 text-xs"
                  style={{
                    borderColor: border,
                    backgroundColor: bg,
                    color: textSecondary,
                  }}
                >
                  Champ de recherche…
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
