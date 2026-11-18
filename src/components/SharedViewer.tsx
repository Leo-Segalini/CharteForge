import React, { useEffect, useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import type { BrandBookData } from '../shared/types.ts';
import { renderBrandBookPages } from '../shared/brandbook/renderer.ts';
import { slugify } from '../shared/colorEngine.ts';

export function SharedViewer({
  token,
  onExit,
}: {
  token: string;
  onExit: () => void;
}) {
  const [brand, setBrand] = useState<BrandBookData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetch(`/api/share/${encodeURIComponent(token)}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || 'Lien invalide.');
        setBrand(data.brand as BrandBookData);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Erreur de chargement.');
      });
  }, [token]);

  const rendered = useMemo(
    () => (brand ? renderBrandBookPages(brand, { showWatermark: false }) : null),
    [brand]
  );

  const handleDownloadPdf = async () => {
    if (!brand) return;
    setDownloading(true);
    try {
      const res = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand }),
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `charte-${slugify(brand.name)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  if (error) {
    return (
      <div className="mx-auto max-w-lg rounded-full border border-red-200 bg-surface-canvas p-8 text-center">
        <p className="text-sm font-medium text-red-700">{error}</p>
        <button
          type="button"
          onClick={onExit}
          className="mt-4 rounded-full bg-violet px-4 py-2 text-xs font-medium text-white"
        >
          Retour à CharteForge
        </button>
      </div>
    );
  }

  if (!brand || !rendered) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="h-16 animate-pulse rounded-2xl bg-surface-canvas" />
        <div className="h-96 animate-pulse rounded-2xl bg-surface-canvas" />
      </div>
    );
  }

  const isLandscape = brand.guideline.format !== 'portrait';
  const rawW = isLandscape ? 1122 : 794;
  const rawH = isLandscape ? 794 : 1122;
  const scale = 0.72;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-hairline pb-4">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">{brand.name}</h1>
          <p className="text-xs text-text-muted">
            Charte graphique partagée · Version {brand.guideline.version}.0
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={downloading}
            onClick={() => void handleDownloadPdf()}
            className="inline-flex items-center gap-1.5 rounded-full bg-violet px-4 py-2 text-xs font-medium text-white hover:bg-ink"
          >
            <Download className="h-3.5 w-3.5" />
            {downloading ? 'Génération…' : 'Télécharger le PDF'}
          </button>
          <button
            type="button"
            onClick={onExit}
            className="rounded-full border border-border-hairline bg-surface-canvas px-4 py-2 text-xs font-medium text-text-secondary"
          >
            Ouvrir l’éditeur
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6">
        {rendered.pages.map((p) => {
          const srcDoc = `<!doctype html><html><head>${rendered.fontHeadHtml}<style>${rendered.css} html,body{background:transparent;overflow:hidden;}.bb-page{margin:0;}</style></head><body>${p.html}</body></html>`;
          return (
            <div
              key={p.id}
              className="overflow-hidden rounded border border-border-hairline bg-surface-canvas shadow-sm"
              style={{
                width: `${Math.round(rawW * scale)}px`,
                height: `${Math.round(rawH * scale)}px`,
              }}
            >
              <iframe
                title={p.title}
                srcDoc={srcDoc}
                style={{
                  width: `${rawW}px`,
                  height: `${rawH}px`,
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                  border: 'none',
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
