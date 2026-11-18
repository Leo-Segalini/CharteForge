import React, { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  FileText,
  FolderArchive,
  History,
  Link2,
} from 'lucide-react';
import type { BrandBookData } from '../../shared/types.ts';
import { renderBrandBookPages } from '../../shared/brandbook/renderer.ts';
import {
  buildBrandJson,
  buildTailwindConfigJs,
  buildTokensCss,
  slugify,
} from '../../shared/colorEngine.ts';
import { useAuth } from '../../context/AuthContext.tsx';

interface Props {
  brand: BrandBookData;
  onSaveVersion: (bumpVersion: boolean) => Promise<void>;
  saving: boolean;
}

export function Step6PreviewExport({ brand, onSaveVersion, saving }: Props) {
  const { getIdToken, profile } = useAuth();
  const isPro = profile?.plan === 'pro' || profile?.role === 'admin';

  const rendered = useMemo(
    () => renderBrandBookPages(brand, { showWatermark: !isPro }),
    [brand, isPro]
  );

  const [pageIdx, setPageIdx] = useState(0);
  const [tokenTab, setTokenTab] = useState<'css' | 'tailwind' | 'json'>('css');
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingZip, setExportingZip] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(
    brand.guideline.shareToken
      ? `${window.location.origin}/?share=${brand.guideline.shareToken}`
      : null
  );
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const safeIdx = Math.min(pageIdx, Math.max(0, rendered.pages.length - 1));
  const currentPage = rendered.pages[safeIdx];

  const currentPageSrcDoc = useMemo(() => {
    if (!currentPage) return '';
    return `<!doctype html>
<html lang="${brand.language}">
<head>
  <meta charset="UTF-8" />
  ${rendered.fontHeadHtml}
  <style>
    ${rendered.css}
    html, body { background: transparent; overflow: hidden; }
    .bb-page { margin: 0; }
  </style>
</head>
<body>${currentPage.html}</body>
</html>`;
  }, [brand.language, currentPage, rendered.css, rendered.fontHeadHtml]);

  const tokenContent = useMemo(() => {
    if (tokenTab === 'css') return buildTokensCss(brand);
    if (tokenTab === 'tailwind') return buildTailwindConfigJs(brand);
    return buildBrandJson(brand);
  }, [brand, tokenTab]);

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = async () => {
    setExportingPdf(true);
    setErrorMsg(null);
    try {
      const token = await getIdToken();
      const res = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ brand }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Échec de génération PDF.');
      }
      const blob = await res.blob();
      downloadBlob(blob, `charte-${slugify(brand.name)}.pdf`);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur export PDF.');
    } finally {
      setExportingPdf(false);
    }
  };

  const handleDownloadZip = async () => {
    setExportingZip(true);
    setErrorMsg(null);
    try {
      const token = await getIdToken();
      const res = await fetch('/api/export/zip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ brand }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Échec de génération du pack ZIP.');
      }
      const blob = await res.blob();
      downloadBlob(blob, `brand-kit-${slugify(brand.name)}.zip`);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur export ZIP.');
    } finally {
      setExportingZip(false);
    }
  };

  const handleCreateShareLink = async () => {
    setErrorMsg(null);
    if (!brand.id) {
      setErrorMsg('Enregistrez d’abord la charte (Connexion Google requise) pour créer un lien de partage.');
      return;
    }
    try {
      const token = await getIdToken();
      if (!token) throw new Error('Connexion requise.');
      const res = await fetch(`/api/brands/${brand.id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ daysValid: 14 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Impossible de générer le lien.');
      setShareUrl(`${window.location.origin}/?share=${data.token}`);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur de partage.');
    }
  };

  const handleCopy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 2000);
  };

  const isLandscape = brand.guideline.format !== 'portrait';
  // Scaled iframe geometry matching A4 297x210 (1122x794 px @96dpi) or 210x297 (794x1122)
  const rawW = isLandscape ? 1122 : 794;
  const rawH = isLandscape ? 794 : 1122;
  const scale = isLandscape ? 0.68 : 0.62;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            06. Aperçu fidèle & exportation PDF / Design System
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Rendu HTML/CSS identique au moteur Playwright PDF · {rendered.pages.length} pages · Version {brand.guideline.version}.0
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            disabled={saving}
            onClick={() => void onSaveVersion(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
          >
            <History className="h-3.5 w-3.5" />
            Enregistrer v{brand.guideline.version + 1}.0
          </button>
          <button
            type="button"
            disabled={exportingZip}
            onClick={handleDownloadZip}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-50 whitespace-nowrap shrink-0"
          >
            <FolderArchive className="h-3.5 w-3.5" />
            {exportingZip ? 'Création du ZIP…' : 'Pack complet (.zip)'}
          </button>
          <button
            type="button"
            disabled={exportingPdf}
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50 whitespace-nowrap shrink-0"
          >
            <Download className="h-3.5 w-3.5" />
            {exportingPdf ? 'Rendu Chromium PDF…' : 'Télécharger le PDF'}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Sidebar Page Index */}
        <div className="rounded-lg border border-slate-200 bg-white p-3 xl:col-span-3">
          <div className="px-2 pb-2 text-xs font-semibold text-slate-500">
            Pages du brand book
          </div>
          <div className="max-h-[540px] space-y-1 overflow-y-auto">
            {rendered.pages.map((p, idx) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPageIdx(idx)}
                className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-xs transition-colors ${
                  idx === safeIdx
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="truncate">{p.title}</span>
                <span className="ml-2 font-mono opacity-75 tabular-nums">
                  {String(p.pageNumber).padStart(2, '0')}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Faithful HTML/PDF Iframe Stage */}
        <div className="flex flex-col items-center rounded-lg border border-slate-200 bg-slate-100 p-5 xl:col-span-9">
          <div className="mb-4 flex w-full items-center justify-between">
            <span className="text-xs font-medium text-slate-600">
              Page {safeIdx + 1} sur {rendered.pages.length} — {currentPage?.title}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={safeIdx === 0}
                onClick={() => setPageIdx((i) => Math.max(0, i - 1))}
                className="rounded border border-slate-200 bg-white p-1.5 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                aria-label="Page précédente"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={safeIdx >= rendered.pages.length - 1}
                onClick={() =>
                  setPageIdx((i) => Math.min(rendered.pages.length - 1, i + 1))
                }
                className="rounded border border-slate-200 bg-white p-1.5 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                aria-label="Page suivante"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div
            className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm"
            style={{
              width: `${Math.round(rawW * scale)}px`,
              height: `${Math.round(rawH * scale)}px`,
            }}
          >
            <iframe
              title={`Aperçu page ${safeIdx + 1}`}
              srcDoc={currentPageSrcDoc}
              style={{
                width: `${rawW}px`,
                height: `${rawH}px`,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                border: 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* Design Tokens & Private Share Link */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-lg border border-slate-200 bg-white p-5 lg:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
              {(
                [
                  { id: 'css', label: 'tokens.css' },
                  { id: 'tailwind', label: 'tailwind.config.js' },
                  { id: 'json', label: 'brand.json' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTokenTab(t.id)}
                  className={`rounded-md px-3 py-1.5 font-mono text-xs font-medium transition-colors ${
                    tokenTab === t.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void handleCopy(tokenContent, 'tokens')}
                className="inline-flex items-center gap-1.5 rounded border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <Copy className="h-3.5 w-3.5" />
                {copiedLabel === 'tokens' ? 'Copié' : 'Copier'}
              </button>
              <button
                type="button"
                onClick={() => {
                  const filename =
                    tokenTab === 'css'
                      ? 'tokens.css'
                      : tokenTab === 'tailwind'
                        ? 'tailwind.config.js'
                        : 'brand.json';
                  downloadBlob(
                    new Blob([tokenContent], { type: 'text/plain;charset=utf-8' }),
                    filename
                  );
                }}
                className="inline-flex items-center gap-1.5 rounded border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <FileText className="h-3.5 w-3.5" />
                Télécharger
              </button>
            </div>
          </div>

          <pre className="mt-4 max-h-64 overflow-auto rounded-lg bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-200">
            {tokenContent}
          </pre>
        </div>

        <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 lg:col-span-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Lien de partage privé
          </h3>
          <p className="text-xs text-slate-500">
            Partagez une version en lecture seule avec votre équipe ou votre client (expiration sous 14 jours).
          </p>
          <button
            type="button"
            onClick={handleCreateShareLink}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2 text-xs font-medium text-slate-800 hover:bg-slate-50"
          >
            <Link2 className="h-3.5 w-3.5" />
            Générer un lien privé
          </button>

          {shareUrl && (
            <div className="rounded border border-slate-200 bg-slate-50 p-3">
              <div className="truncate font-mono text-xs text-slate-700">
                {shareUrl}
              </div>
              <button
                type="button"
                onClick={() => void handleCopy(shareUrl, 'share')}
                className="mt-2 text-xs font-medium text-slate-900 underline"
              >
                {copiedLabel === 'share' ? 'Lien copié' : 'Copier le lien'}
              </button>
            </div>
          )}

          <div className="border-t border-slate-100 pt-4">
            <div className="text-xs font-medium text-slate-700">
              Exemple de charte pré-générée
            </div>
            <a
              href="/demo-charte-aurelia.pdf"
              download="demo-charte-aurelia.pdf"
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-slate-900 underline"
            >
              <Download className="h-3.5 w-3.5" />
              Télécharger demo-charte-aurelia.pdf
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
