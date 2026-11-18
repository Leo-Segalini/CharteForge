import type {
  BrandBookData,
  DocumentFormat,
  DocumentLanguage,
  FontAssetData,
  LayoutTemplate,
  LogoAssetData,
  SectionId,
} from '../types.ts';
import {
  buildTokensCss,
  evaluateWcag,
  generateShades,
  getColorByRole,
  getContrastText,
  hexToCmyk,
  hexToHsl,
  hexToRgb,
  normalizeHex,
} from '../colorEngine.ts';
import { ALL_SECTIONS } from './sections.ts';

export interface RenderOptions {
  showWatermark?: boolean;
  singlePageId?: SectionId;
}

export interface RenderedPage {
  id: SectionId;
  title: string;
  pageNumber: number;
  html: string;
}

function esc(value: string | undefined | null): string {
  if (!value) return '';
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getLogoByType(
  logos: LogoAssetData[],
  preferred: LogoAssetData['variantType'][]
): LogoAssetData | null {
  for (const type of preferred) {
    const found = logos.find((l) => l.variantType === type);
    if (found) return found;
  }
  return logos[0] ?? null;
}

function buildMissingLogoSvg(brandName: string, colorHex: string): string {
  const initials = (brandName || 'B')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
  const textFill = getContrastText(colorHex);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 64" width="180" height="64">
    <rect x="2" y="8" width="48" height="48" rx="10" fill="${colorHex}"/>
    <text x="26" y="39" text-anchor="middle" font-family="sans-serif" font-size="20" font-weight="700" fill="${textFill}">${esc(initials)}</text>
    <text x="64" y="39" font-family="sans-serif" font-size="20" font-weight="700" fill="${colorHex}">${esc(brandName)}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function getGoogleFontLinksHtml(fonts: FontAssetData[]): string {
  const googleFamilies = Array.from(
    new Set(
      fonts
        .filter((f) => f.source === 'google' && f.family)
        .map((f) => f.family.trim())
    )
  );
  if (googleFamilies.length === 0) return '';
  const query = googleFamilies
    .map((fam) => `family=${encodeURIComponent(fam)}:wght@400;500;600;700`)
    .join('&');
  return `<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?${query}&display=swap" rel="stylesheet" />`;
}

function getUploadedFontFacesCss(fonts: FontAssetData[]): string {
  return fonts
    .filter((f) => f.source === 'upload' && f.woff2DataUrl)
    .map(
      (f) => `@font-face {
  font-family: '${f.family.replace(/'/g, '')}';
  src: url('${f.woff2DataUrl}');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}`
    )
    .join('\n');
}

function buildBrandCssVariables(brand: BrandBookData): string {
  const template: LayoutTemplate = brand.guideline.template || 'classic';
  const rawPrimary = getColorByRole(brand.colors, 'primary', '#182B49');
  const rawSecondary = getColorByRole(brand.colors, 'secondary', '#334E68');
  const rawAccent = getColorByRole(brand.colors, 'accent', '#C97B36');
  const rawBg = getColorByRole(brand.colors, 'background', '#FFFFFF');
  const rawSurface = getColorByRole(brand.colors, 'surface', '#F8FAFC');
  const rawText = getColorByRole(brand.colors, 'text_primary', '#0F172A');
  const rawTextMuted = getColorByRole(brand.colors, 'text_secondary', '#475569');
  const rawBorder = getColorByRole(brand.colors, 'border', '#E2E8F0');
  const rawSuccess = getColorByRole(brand.colors, 'success', '#16A34A');
  const rawWarning = getColorByRole(brand.colors, 'warning', '#D97706');
  const rawError = getColorByRole(brand.colors, 'error', '#DC2626');

  // Minimal template intentionally forces crisp neutral monochrome + 1 accent color
  const primary = template === 'minimal' ? '#0F172A' : rawPrimary;
  const secondary = template === 'minimal' ? '#334155' : rawSecondary;
  const accent = rawAccent;
  const bg = template === 'minimal' ? '#FFFFFF' : rawBg;
  const surface = template === 'minimal' ? '#F8FAFC' : rawSurface;
  const text = template === 'minimal' ? '#0F172A' : rawText;
  const textMuted = template === 'minimal' ? '#475569' : rawTextMuted;
  const border = template === 'minimal' ? '#E2E8F0' : rawBorder;

  const headingFont = brand.fonts.find((f) => f.role === 'heading');
  const bodyFont = brand.fonts.find((f) => f.role === 'body');
  const monoFont = brand.fonts.find((f) => f.role === 'mono');

  const onPrimary = getContrastText(primary);
  const onSecondary = getContrastText(secondary);
  const onAccent = getContrastText(accent);
  const onBg = getContrastText(bg, '#FFFFFF', text);
  const onSurface = getContrastText(surface, '#FFFFFF', text);

  const grad1 = brand.gradients[0];
  const grad2 = brand.gradients[1];

  return `
  :root {
    --bb-primary: ${primary};
    --bb-secondary: ${secondary};
    --bb-accent: ${accent};
    --bb-bg: ${bg};
    --bb-surface: ${surface};
    --bb-text: ${onBg};
    --bb-text-surface: ${onSurface};
    --bb-text-muted: ${textMuted};
    --bb-border: ${border};
    --bb-success: ${rawSuccess};
    --bb-warning: ${rawWarning};
    --bb-error: ${rawError};
    --bb-on-primary: ${onPrimary};
    --bb-on-secondary: ${onSecondary};
    --bb-on-accent: ${onAccent};
    --bb-grad-1: linear-gradient(${grad1?.angle ?? 135}deg, ${grad1?.fromHex ?? primary}, ${grad1?.toHex ?? secondary});
    --bb-grad-2: linear-gradient(${grad2?.angle ?? 120}deg, ${grad2?.fromHex ?? secondary}, ${grad2?.toHex ?? accent});
    --bb-font-heading: '${headingFont?.family ?? 'Plus Jakarta Sans'}', ${headingFont?.fallback ?? 'sans-serif'};
    --bb-font-body: '${bodyFont?.family ?? 'Public Sans'}', ${bodyFont?.fallback ?? 'sans-serif'};
    --bb-font-mono: '${monoFont?.family ?? 'JetBrains Mono'}', ${monoFont?.fallback ?? 'monospace'};
    --bb-radius-sm: ${brand.gridConfig.radiusSmPx}px;
    --bb-radius-md: ${brand.gridConfig.radiusMdPx}px;
    --bb-radius-lg: ${brand.gridConfig.radiusLgPx}px;
  }`;
}

function buildDocumentCss(brand: BrandBookData, format: DocumentFormat): string {
  const isLandscape = format === 'landscape';
  const pageWidth = isLandscape ? '297mm' : '210mm';
  const pageHeight = isLandscape ? '210mm' : '297mm';
  const template = brand.guideline.template || 'classic';

  return `
  ${getUploadedFontFacesCss(brand.fonts)}
  ${buildBrandCssVariables(brand)}

  @page {
    size: ${isLandscape ? 'A4 landscape' : 'A4 portrait'};
    margin: 0;
  }

  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  html, body {
    margin: 0;
    padding: 0;
    background: #E2E8F0;
    font-family: var(--bb-font-body);
    color: var(--bb-text);
  }

  .bb-page {
    width: ${pageWidth};
    height: ${pageHeight};
    background: var(--bb-bg);
    color: var(--bb-text);
    position: relative;
    overflow: hidden;
    padding: ${template === 'editorial' ? '16mm 18mm' : '13mm 15mm'};
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    page-break-after: always;
    break-after: page;
  }

  .bb-page:last-child {
    page-break-after: auto;
    break-after: auto;
  }

  .bb-page.bb-cover {
    padding: 0;
  }

  .bb-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--bb-border);
    padding-bottom: 4mm;
    margin-bottom: 5mm;
    flex-shrink: 0;
  }

  .bb-header-left {
    display: flex;
    align-items: baseline;
    gap: 8px;
    font-size: 9pt;
    color: var(--bb-text-muted);
  }

  .bb-header-index {
    font-family: var(--bb-font-mono);
    font-weight: 600;
    color: var(--bb-accent);
  }

  .bb-header-brand {
    font-family: var(--bb-font-heading);
    font-weight: 600;
    font-size: 9pt;
    color: var(--bb-text);
  }

  .bb-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: ${template === 'editorial' ? '6mm' : '4.5mm'};
    min-height: 0;
  }

  .bb-title-block {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 10mm;
  }

  .bb-h1 {
    font-family: var(--bb-font-heading);
    font-size: ${template === 'editorial' ? '26pt' : '21pt'};
    font-weight: 700;
    line-height: 1.1;
    margin: 0;
    letter-spacing: -0.02em;
    color: var(--bb-text);
  }

  .bb-lead {
    font-size: 9.5pt;
    line-height: 1.48;
    color: var(--bb-text-muted);
    margin: 2mm 0 0 0;
    max-width: ${isLandscape ? '185mm' : '155mm'};
  }

  .bb-card {
    background: var(--bb-surface);
    color: var(--bb-text-surface);
    border: ${template === 'editorial' ? 'none' : '1px solid var(--bb-border)'};
    border-top: ${template === 'editorial' ? '1.5px solid var(--bb-border)' : '1px solid var(--bb-border)'};
    border-radius: ${template === 'minimal' ? '2px' : 'var(--bb-radius-md)'};
    padding: 4mm;
  }

  .bb-grid-2 {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 4.5mm;
  }

  .bb-grid-3 {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 4mm;
  }

  .bb-grid-4 {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 3.5mm;
  }

  .bb-mono {
    font-family: var(--bb-font-mono);
    font-variant-numeric: tabular-nums;
  }

  .bb-label {
    font-size: 7.5pt;
    font-weight: 600;
    color: var(--bb-text-muted);
    margin-bottom: 1.5mm;
  }

  .bb-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid var(--bb-border);
    padding-top: 3mm;
    margin-top: 4mm;
    font-size: 7.5pt;
    color: var(--bb-text-muted);
    flex-shrink: 0;
  }

  .bb-watermark {
    position: absolute;
    bottom: 11mm;
    right: 15mm;
    font-family: var(--bb-font-mono);
    font-size: 7.5pt;
    color: var(--bb-text-muted);
    opacity: 0.55;
    pointer-events: none;
  }

  table.bb-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 8.2pt;
  }

  table.bb-table th,
  table.bb-table td {
    text-align: left;
    padding: 2.2mm 2.5mm;
    border-bottom: 1px solid var(--bb-border);
  }

  table.bb-table th {
    font-weight: 600;
    color: var(--bb-text-muted);
    font-size: 7.5pt;
  }

  .bb-tag {
    display: inline-block;
    padding: 1px 6px;
    border-radius: var(--bb-radius-sm);
    font-size: 7.2pt;
    font-weight: 600;
    font-family: var(--bb-font-mono);
  }

  .bb-logo-box {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4mm;
    border-radius: var(--bb-radius-sm);
    min-height: 28mm;
  }

  .bb-logo-box img {
    max-width: 100%;
    max-height: 22mm;
    object-fit: contain;
  }

  @media print {
    html, body {
      background: #FFFFFF;
    }
    .bb-page {
      margin: 0;
      box-shadow: none;
    }
  }
  `;
}

export function renderBrandBookPages(
  brand: BrandBookData,
  options: RenderOptions = {}
): { css: string; fontHeadHtml: string; pages: RenderedPage[] } {
  const lang: DocumentLanguage = brand.language === 'en' ? 'en' : 'fr';
  const format: DocumentFormat = brand.guideline.format === 'portrait' ? 'portrait' : 'landscape';
  const isLandscape = format === 'landscape';
  const template: LayoutTemplate = brand.guideline.template || 'classic';

  const primary = template === 'minimal' ? '#0F172A' : getColorByRole(brand.colors, 'primary', '#182B49');
  const secondary = template === 'minimal' ? '#334155' : getColorByRole(brand.colors, 'secondary', '#334E68');
  const accent = getColorByRole(brand.colors, 'accent', '#C97B36');
  const bg = template === 'minimal' ? '#FFFFFF' : getColorByRole(brand.colors, 'background', '#FFFFFF');
  const surface = template === 'minimal' ? '#F8FAFC' : getColorByRole(brand.colors, 'surface', '#F8FAFC');
  const textPrimary = getColorByRole(brand.colors, 'text_primary', '#0F172A');
  const textSecondary = getColorByRole(brand.colors, 'text_secondary', '#475569');
  const border = getColorByRole(brand.colors, 'border', '#E2E8F0');
  const success = getColorByRole(brand.colors, 'success', '#16A34A');
  const warning = getColorByRole(brand.colors, 'warning', '#D97706');
  const error = getColorByRole(brand.colors, 'error', '#DC2626');

  const onPrimary = getContrastText(primary);
  const onAccent = getContrastText(accent);

  const fallbackLogo = buildMissingLogoSvg(brand.name, primary);
  const primaryLogo = getLogoByType(brand.logos, ['primary', 'horizontal', 'vertical'])?.dataUrl ?? fallbackLogo;
  const monoDarkLogo = getLogoByType(brand.logos, ['mono_dark', 'primary'])?.dataUrl ?? primaryLogo;
  const monoLightLogo = getLogoByType(brand.logos, ['mono_light', 'negative', 'primary'])?.dataUrl ?? primaryLogo;
  const monogramLogo = getLogoByType(brand.logos, ['monogram', 'primary'])?.dataUrl ?? primaryLogo;
  const noBaselineLogo = getLogoByType(brand.logos, ['no_baseline', 'primary'])?.dataUrl ?? primaryLogo;

  const enabledIds = brand.guideline.enabledSections.length
    ? brand.guideline.enabledSections
    : ALL_SECTIONS.map((s) => s.id);

  const activeSections = ALL_SECTIONS.filter((s) => enabledIds.includes(s.id));
  const pageNumberMap = new Map<SectionId, number>();
  activeSections.forEach((s, idx) => pageNumberMap.set(s.id, idx + 1));

  const getTitle = (id: SectionId) => {
    const def = ALL_SECTIONS.find((s) => s.id === id);
    if (!def) return id;
    return lang === 'en' ? def.titleEn : def.titleFr;
  };

  const getCopy = (id: SectionId) => {
    const custom = brand.guideline.sectionCopy?.[id];
    if (custom && custom.trim().length > 0) return custom;
    const def = ALL_SECTIONS.find((s) => s.id === id);
    return lang === 'en' ? def?.defaultCopyEn ?? '' : def?.defaultCopyFr ?? '';
  };

  const todayFormatted = new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  const wrapPage = (id: SectionId, pageNum: number, bodyHtml: string, isCover = false): string => {
    const watermarkHtml = options.showWatermark
      ? `<div class="bb-watermark">CharteForge · ${lang === 'en' ? 'Free Edition' : 'Offre Gratuite'}</div>`
      : '';

    if (isCover) {
      return `<section class="bb-page bb-cover" data-section="${id}">${bodyHtml}${watermarkHtml}</section>`;
    }

    const sectionTitle = getTitle(id);
    const numStr = String(pageNum).padStart(2, '0');

    return `<section class="bb-page" data-section="${id}">
      <header class="bb-header">
        <div class="bb-header-left">
          <span class="bb-header-index">${numStr}</span>
          <span>/</span>
          <span>${esc(sectionTitle)}</span>
        </div>
        <div class="bb-header-brand">${esc(brand.name)}</div>
      </header>
      <div class="bb-main">
        ${bodyHtml}
      </div>
      <footer class="bb-footer">
        <span>${esc(brand.name)} · ${lang === 'en' ? 'Brand Guidelines' : 'Charte Graphique'} v${brand.guideline.version}.0</span>
        <span class="bb-mono">${numStr} / ${String(activeSections.length).padStart(2, '0')}</span>
      </footer>
      ${watermarkHtml}
    </section>`;
  };

  const headingIntro = (id: SectionId) => `
    <div class="bb-title-block">
      <div>
        <h1 class="bb-h1">${esc(getTitle(id))}</h1>
        <p class="bb-lead">${esc(getCopy(id))}</p>
      </div>
    </div>
  `;

  const renderSectionContent = (id: SectionId, pageNum: number): string => {
    switch (id) {
      case 'cover': {
        const coverBg = template === 'minimal' ? '#FFFFFF' : primary;
        const coverText = getContrastText(coverBg);
        const coverLogo = coverText === '#FFFFFF' ? monoLightLogo : primaryLogo;
        return wrapPage(
          id,
          pageNum,
          `<div style="height:100%;display:flex;flex-direction:column;justify-content:space-between;padding:18mm;background:${template === 'editorial' ? bg : coverBg};color:${template === 'editorial' ? textPrimary : coverText};position:relative;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span class="bb-mono" style="font-size:8.5pt;opacity:0.8;">${lang === 'en' ? 'BRAND GUIDELINES & DESIGN SYSTEM' : 'CHARTE GRAPHIQUE & DESIGN SYSTEM'}</span>
              <span class="bb-mono" style="font-size:8.5pt;opacity:0.8;">v${brand.guideline.version}.0 · ${esc(todayFormatted)}</span>
            </div>
            <div style="display:flex;flex-direction:column;gap:8mm;max-width:190mm;">
              <div style="height:26mm;display:flex;align-items:center;">
                <img src="${template === 'editorial' ? primaryLogo : coverLogo}" alt="${esc(brand.name)}" style="max-height:24mm;max-width:105mm;object-fit:contain;" />
              </div>
              <div>
                <h1 style="font-family:var(--bb-font-heading);font-size:${isLandscape ? '38pt' : '32pt'};font-weight:700;line-height:1.06;margin:0;letter-spacing:-0.025em;">${esc(brand.name)}</h1>
                ${brand.baseline ? `<p style="font-size:13pt;margin:4mm 0 0 0;opacity:0.85;">${esc(brand.baseline)}</p>` : ''}
              </div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:flex-end;border-top:1px solid ${template === 'editorial' ? border : 'rgba(255,255,255,0.22)'};padding-top:5mm;">
              <div style="font-size:8.5pt;opacity:0.8;">${esc(brand.sector || (lang === 'en' ? 'Corporate Identity' : 'Identité visuelle officielle'))}</div>
              <div style="display:flex;gap:3mm;">
                ${brand.colors.slice(0, 5).map((c) => `<span style="width:10mm;height:4mm;border-radius:2px;background:${normalizeHex(c.hex)};border:1px solid rgba(255,255,255,0.25);"></span>`).join('')}
              </div>
            </div>
          </div>`,
          true
        );
      }

      case 'toc': {
        const items = activeSections.filter((s) => s.id !== 'cover' && s.id !== 'toc');
        const half = Math.ceil(items.length / 2);
        const colA = items.slice(0, half);
        const colB = items.slice(half);
        const renderItem = (s: (typeof ALL_SECTIONS)[number]) => {
          const pNum = String(pageNumberMap.get(s.id) ?? 1).padStart(2, '0');
          return `<div style="display:flex;align-items:baseline;justify-content:space-between;padding:2.5mm 0;border-bottom:1px solid var(--bb-border);font-size:9.5pt;">
            <span>${esc(lang === 'en' ? s.titleEn : s.titleFr)}</span>
            <span class="bb-mono" style="font-weight:600;color:var(--bb-accent);">${pNum}</span>
          </div>`;
        };
        return wrapPage(
          id,
          pageNum,
          `${headingIntro(id)}
          <div class="bb-grid-2" style="margin-top:2mm;">
            <div>${colA.map(renderItem).join('')}</div>
            <div>${colB.map(renderItem).join('')}</div>
          </div>`
        );
      }

      case 'identity': {
        const vals = brand.values.length ? brand.values : ['Clarté', 'Cohérence', 'Exigence'];
        return wrapPage(
          id,
          pageNum,
          `${headingIntro(id)}
          <div class="bb-grid-2" style="flex:1;">
            <div class="bb-card" style="display:flex;flex-direction:column;justify-content:space-between;">
              <div>
                <div class="bb-label">${lang === 'en' ? 'Positioning & Territory' : 'Territoire & Positionnement'}</div>
                <h2 style="font-family:var(--bb-font-heading);font-size:15pt;margin:0 0 3mm 0;">${esc(brand.name)}</h2>
                <p style="font-size:9.5pt;line-height:1.55;margin:0;color:var(--bb-text-muted);">${esc(brand.description || 'Marque structurée autour d’une identité visuelle claire et durable.')}</p>
              </div>
              <div style="margin-top:5mm;padding-top:3.5mm;border-top:1px solid var(--bb-border);display:grid;grid-template-columns:1fr 1fr;gap:3mm;font-size:8.5pt;">
                <div><span class="bb-label" style="display:block;">${lang === 'en' ? 'Sector' : 'Secteur'}</span>${esc(brand.sector || '—')}</div>
                <div><span class="bb-label" style="display:block;">Baseline</span>${esc(brand.baseline || '—')}</div>
              </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:3.5mm;">
              <div class="bb-card" style="background:${primary};color:${onPrimary};border-color:${primary};">
                <div style="font-size:7.5pt;opacity:0.78;margin-bottom:1.5mm;">${lang === 'en' ? 'Core Brand Pillars' : 'Valeurs & Principes Directeurs'}</div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:2.5mm;">
                  ${vals.slice(0, 4).map((v, i) => `<div style="padding:2.5mm;border:1px solid rgba(255,255,255,0.2);border-radius:var(--bb-radius-sm);">
                    <span class="bb-mono" style="font-size:7.5pt;opacity:0.75;">0${i + 1}</span>
                    <div style="font-weight:600;font-size:9.5pt;margin-top:1mm;">${esc(v)}</div>
                  </div>`).join('')}
                </div>
              </div>
              <div class="bb-card">
                <div class="bb-label">${lang === 'en' ? 'Editorial Voice' : 'Expression & Ton'}</div>
                <p style="font-size:8.8pt;line-height:1.5;margin:0;color:var(--bb-text-muted);">${lang === 'en' ? 'Direct, precise, and accessible communication across print, web interfaces, and institutional materials.' : 'Une prise de parole directe, rigoureuse et accessible sur tous les supports imprimés, numériques et institutionnels.'}</p>
              </div>
            </div>
          </div>`
        );
      }

      case 'logotype': {
        const variants: Array<{ code: string; label: string; src: string; bg: string; note: string }> = [
          { code: 'A', label: lang === 'en' ? 'Primary Logo' : 'Logo Principal', src: primaryLogo, bg: '#FFFFFF', note: lang === 'en' ? 'Default on light canvas' : 'Usage par défaut sur fond clair' },
          { code: 'B', label: lang === 'en' ? 'Negative / White' : 'Version Négative', src: monoLightLogo, bg: primary, note: lang === 'en' ? 'Dark or brand backgrounds' : 'Fonds sombres ou couleur primaire' },
          { code: 'C', label: lang === 'en' ? 'Monochrome Dark' : 'Monochrome Noir', src: monoDarkLogo, bg: '#F8FAFC', note: lang === 'en' ? 'Black & white print' : 'Impression N&B / tampon' },
          { code: 'D', label: lang === 'en' ? 'Without Baseline' : 'Sans Baseline', src: noBaselineLogo, bg: '#FFFFFF', note: lang === 'en' ? 'Compact spaces (< 110px)' : 'Formats compacts (< 110px)' },
          { code: 'E', label: lang === 'en' ? 'Monogram / Symbol' : 'Monogramme / Symbole', src: monogramLogo, bg: surface, note: lang === 'en' ? 'Favicon, avatars, app icon' : 'Favicon, avatars, icône app' },
          { code: 'F', label: lang === 'en' ? 'On Dark Slate' : 'Sur Fond Anthracite', src: monoLightLogo, bg: '#0F172A', note: lang === 'en' ? 'High-contrast dark UI' : 'Interfaces sombres' },
        ];
        return wrapPage(
          id,
          pageNum,
          `${headingIntro(id)}
          <div class="bb-grid-3">
            ${variants
              .map(
                (v) => `<div class="bb-card" style="padding:3mm;display:flex;flex-direction:column;gap:2.5mm;">
                  <div class="bb-logo-box" style="background:${v.bg};border:1px solid var(--bb-border);position:relative;">
                    <span class="bb-mono" style="position:absolute;top:1.5mm;left:2mm;font-size:7pt;font-weight:700;opacity:0.55;color:${getContrastText(v.bg)};">${v.code}</span>
                    <img src="${v.src}" alt="${esc(v.label)}" />
                  </div>
                  <div>
                    <div style="font-weight:600;font-size:8.8pt;"><span class="bb-mono" style="color:var(--bb-accent);margin-right:4px;">${v.code}·</span>${esc(v.label)}</div>
                    <div style="font-size:7.5pt;color:var(--bb-text-muted);">${esc(v.note)}</div>
                  </div>
                </div>`
              )
              .join('')}
          </div>`
        );
      }

      case 'clearspace': {
        const p = brand.protectionConfig;
        return wrapPage(
          id,
          pageNum,
          `${headingIntro(id)}
          <div class="bb-grid-2" style="flex:1;">
            <div class="bb-card" style="display:flex;flex-direction:column;justify-content:center;align-items:center;position:relative;background:#FFFFFF;">
              <div class="bb-label" style="position:absolute;top:3.5mm;left:4mm;">${lang === 'en' ? 'Exclusion Zone Diagram' : 'Schéma de zone d’exclusion'}</div>
              <div style="position:relative;padding:12mm 16mm;border:1.5px dashed ${accent};background:rgba(201,123,54,0.06);">
                <div style="position:absolute;top:2mm;left:50%;transform:translateX(-50%);font-family:var(--bb-font-mono);font-size:7.5pt;color:${accent};font-weight:600;">${p.marginMultiplier}X</div>
                <div style="position:absolute;bottom:2mm;left:50%;transform:translateX(-50%);font-family:var(--bb-font-mono);font-size:7.5pt;color:${accent};font-weight:600;">${p.marginMultiplier}X</div>
                <div style="position:absolute;left:3mm;top:50%;transform:translateY(-50%);font-family:var(--bb-font-mono);font-size:7.5pt;color:${accent};font-weight:600;">${p.marginMultiplier}X</div>
                <div style="position:absolute;right:3mm;top:50%;transform:translateY(-50%);font-family:var(--bb-font-mono);font-size:7.5pt;color:${accent};font-weight:600;">${p.marginMultiplier}X</div>
                <div style="border:1px solid ${border};padding:3mm;background:#FFFFFF;">
                  <img src="${primaryLogo}" alt="${esc(brand.name)}" style="max-height:20mm;max-width:65mm;object-fit:contain;display:block;" />
                </div>
              </div>
              <div class="bb-mono" style="font-size:7.5pt;color:var(--bb-text-muted);margin-top:4mm;">X = ${esc(p.unitLabel)}</div>
            </div>
            <div style="display:flex;flex-direction:column;gap:4mm;">
              <div class="bb-card">
                <div class="bb-label">${lang === 'en' ? 'Minimum Sizes' : 'Tailles minimales d’utilisation'}</div>
                <table class="bb-table">
                  <thead><tr><th>${lang === 'en' ? 'Support' : 'Support'}</th><th>${lang === 'en' ? 'With baseline' : 'Avec baseline'}</th><th>${lang === 'en' ? 'No baseline' : 'Sans baseline'}</th></tr></thead>
                  <tbody>
                    <tr><td>${lang === 'en' ? 'Digital (Web / App)' : 'Numérique (Web / App)'}</td><td class="bb-mono">${p.minDigitalPx} px</td><td class="bb-mono">${p.minNoBaselinePx} px</td></tr>
                    <tr><td>${lang === 'en' ? 'Print (Offset / Laser)' : 'Impression (Print)'}</td><td class="bb-mono">${p.minPrintMm} mm</td><td class="bb-mono">${Math.round(p.minPrintMm * 0.65)} mm</td></tr>
                    <tr><td>${lang === 'en' ? 'Monogram only' : 'Monogramme seul'}</td><td class="bb-mono">—</td><td class="bb-mono">24 px / 8 mm</td></tr>
                  </tbody>
                </table>
              </div>
              <div class="bb-card">
                <div class="bb-label">${lang === 'en' ? 'Proportion Rule' : 'Règle de proportionnalité'}</div>
                <p style="font-size:8.5pt;line-height:1.5;margin:0;color:var(--bb-text-muted);">
                  ${lang === 'en' ? `Maintain at least ${p.marginMultiplier}× unit X free of any text, border, or graphic element around all four sides of the logotype.` : `Conserver un espace libre minimal de ${p.marginMultiplier}× l’unité X sur les quatre côtés du logotype, exempt de tout texte, filet ou icône.`}
                </p>
              </div>
            </div>
          </div>`
        );
      }

      case 'misuse': {
        const cases: Array<{ title: string; style: string; bg: string; extra?: string }> = [
          { title: lang === 'en' ? 'Do not stretch' : 'Ne pas étirer / déformer', style: 'transform:scaleX(1.45) scaleY(0.68);', bg: '#FFFFFF' },
          { title: lang === 'en' ? 'Do not rotate' : 'Ne pas pivoter', style: 'transform:rotate(-16deg);', bg: '#FFFFFF' },
          { title: lang === 'en' ? 'Do not alter colors' : 'Ne pas changer les teintes', style: 'filter:hue-rotate(145deg) saturate(2.8);', bg: '#FFFFFF' },
          { title: lang === 'en' ? 'Do not add effects' : 'Ne pas ajouter d’ombre/lueur', style: 'filter:drop-shadow(4px 6px 4px #EF4444);', bg: '#FFFFFF' },
          { title: lang === 'en' ? 'Avoid low contrast' : 'Éviter les fonds sans contraste', style: 'opacity:0.25;', bg: primary },
          { title: lang === 'en' ? 'Avoid busy backgrounds' : 'Éviter les fonds chargés', style: '', bg: 'repeating-linear-gradient(45deg,#cbd5e1,#cbd5e1 4px,#64748b 4px,#64748b 8px)' },
          { title: lang === 'en' ? 'Never below min size' : 'Ne pas réduire sous le seuil', style: 'width:26px;height:auto;filter:blur(0.4px);', bg: '#FFFFFF' },
          { title: lang === 'en' ? 'Do not skew or crop' : 'Ne pas incliner / tronquer', style: 'transform:skewX(-22deg);', bg: '#FFFFFF' },
        ];
        return wrapPage(
          id,
          pageNum,
          `${headingIntro(id)}
          <div class="bb-grid-4">
            ${cases
              .map(
                (c) => `<div class="bb-card" style="padding:2.8mm;display:flex;flex-direction:column;gap:2mm;">
                  <div style="height:24mm;display:flex;align-items:center;justify-content:center;background:${c.bg};border:1px solid var(--bb-border);border-radius:var(--bb-radius-sm);overflow:hidden;position:relative;">
                    <img src="${primaryLogo}" alt="" style="max-height:15mm;max-width:85%;object-fit:contain;${c.style}" />
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;opacity:0.7;">
                      <line x1="6" y1="6" x2="94" y2="94" stroke="${error}" stroke-width="2.2" />
                      <line x1="94" y1="6" x2="6" y2="94" stroke="${error}" stroke-width="2.2" />
                    </svg>
                    <span style="position:absolute;top:1.5mm;right:2mm;color:${error};font-weight:700;font-size:9pt;background:#FFFFFF;padding:0 1.2mm;border-radius:2px;">✕</span>
                  </div>
                  <div style="font-size:7.8pt;font-weight:600;color:${error};">${esc(c.title)}</div>
                </div>`
              )
              .join('')}
          </div>`
        );
      }

      case 'palette': {
        const displayColors = brand.colors.slice(0, 8);
        return wrapPage(
          id,
          pageNum,
          `${headingIntro(id)}
          <div class="bb-grid-4">
            ${displayColors
              .map((c) => {
                const hex = normalizeHex(c.hex);
                const rgb = hexToRgb(hex);
                const hsl = hexToHsl(hex);
                const cmyk = hexToCmyk(hex);
                const onSwatch = getContrastText(hex);
                const shades = generateShades(hex).filter((s) => [200, 400, 500, 700, 900].includes(s.step));
                return `<div class="bb-card" style="padding:0;overflow:hidden;display:flex;flex-direction:column;">
                  <div style="height:17mm;background:${hex};color:${onSwatch};padding:2.5mm 3mm;display:flex;flex-direction:column;justify-content:space-between;">
                    <span class="bb-mono" style="font-size:7pt;opacity:0.85;">${esc(c.role)}</span>
                    <span class="bb-mono" style="font-size:9.5pt;font-weight:600;">${hex}</span>
                  </div>
                  <div style="display:flex;height:3mm;">
                    ${shades.map((s) => `<span style="flex:1;background:${s.hex};"></span>`).join('')}
                  </div>
                  <div style="padding:2.5mm 3mm;font-size:7.2pt;display:flex;flex-direction:column;gap:0.8mm;">
                    <div style="font-weight:600;font-size:8.2pt;margin-bottom:0.8mm;">${esc(c.name)}</div>
                    <div class="bb-mono" style="color:var(--bb-text-muted);">RGB ${rgb.r}, ${rgb.g}, ${rgb.b}</div>
                    <div class="bb-mono" style="color:var(--bb-text-muted);">HSL ${hsl.h}° ${hsl.s}% ${hsl.l}%</div>
                    <div class="bb-mono" style="color:var(--bb-text-muted);">CMJN ${cmyk.c}/${cmyk.m}/${cmyk.y}/${cmyk.k}</div>
                  </div>
                </div>`;
              })
              .join('')}
          </div>`
        );
      }

      case 'balance': {
        const g1 = brand.gradients[0] ?? { name: 'Dégradé 1', angle: 135, fromHex: primary, toHex: secondary };
        const g2 = brand.gradients[1] ?? { name: 'Dégradé 2', angle: 120, fromHex: secondary, toHex: accent };
        return wrapPage(
          id,
          pageNum,
          `${headingIntro(id)}
          <div style="display:flex;flex-direction:column;gap:5mm;">
            <div class="bb-card">
              <div class="bb-label">${lang === 'en' ? '60-30-10 Proportion Rule' : 'Répartition chromatique 60 / 30 / 10'}</div>
              <div style="display:flex;height:14mm;border-radius:var(--bb-radius-sm);overflow:hidden;border:1px solid var(--bb-border);margin-top:2mm;">
                <div style="width:60%;background:${bg};color:${getContrastText(bg)};display:flex;align-items:center;padding:0 4mm;font-size:8.5pt;font-weight:600;">60 % · ${lang === 'en' ? 'Canvas' : 'Fonds neutres'} (${bg})</div>
                <div style="width:30%;background:${primary};color:${onPrimary};display:flex;align-items:center;padding:0 4mm;font-size:8.5pt;font-weight:600;">30 % · ${lang === 'en' ? 'Structure' : 'Structure'} (${primary})</div>
                <div style="width:10%;background:${accent};color:${onAccent};display:flex;align-items:center;justify-content:center;font-size:8pt;font-weight:600;">10 %</div>
              </div>
            </div>
            <div class="bb-grid-2">
              ${[g1, g2]
                .map((g) => {
                  const cssGrad = `linear-gradient(${g.angle}deg, ${g.fromHex}, ${g.toHex})`;
                  const onG = getContrastText(g.fromHex);
                  return `<div class="bb-card" style="padding:0;overflow:hidden;">
                    <div style="height:34mm;background:${cssGrad};color:${onG};padding:4mm;display:flex;flex-direction:column;justify-content:space-between;">
                      <span class="bb-mono" style="font-size:7.5pt;opacity:0.85;">${g.angle}°</span>
                      <div style="font-family:var(--bb-font-heading);font-size:12pt;font-weight:600;">${esc(g.name)}</div>
                    </div>
                    <div class="bb-mono" style="padding:3mm 4mm;font-size:7.8pt;color:var(--bb-text-muted);display:flex;justify-content:space-between;">
                      <span>${normalizeHex(g.fromHex)} → ${normalizeHex(g.toHex)}</span>
                      <span>CSS linear-gradient</span>
                    </div>
                  </div>`;
                })
                .join('')}
            </div>
          </div>`
        );
      }

      case 'accessibility': {
        const pairs = [
          { label: 'Texte principal sur Fond', fg: textPrimary, bg: bg },
          { label: 'Texte secondaire sur Fond', fg: textSecondary, bg: bg },
          { label: 'Texte principal sur Surface', fg: textPrimary, bg: surface },
          { label: 'Texte contrasté sur Primaire', fg: onPrimary, bg: primary },
          { label: 'Accent sur Fond principal', fg: accent, bg: bg },
          { label: 'Succès sur Surface', fg: success, bg: surface },
          { label: 'Erreur sur Surface', fg: error, bg: surface },
        ];
        return wrapPage(
          id,
          pageNum,
          `${headingIntro(id)}
          <div class="bb-card" style="padding:2mm 4mm;">
            <table class="bb-table">
              <thead>
                <tr>
                  <th>${lang === 'en' ? 'Color Pair' : 'Association testée'}</th>
                  <th>${lang === 'en' ? 'Sample' : 'Aperçu'}</th>
                  <th>${lang === 'en' ? 'Ratio' : 'Ratio'}</th>
                  <th>WCAG AA</th>
                  <th>WCAG AAA</th>
                  <th>${lang === 'en' ? 'Recommendation' : 'Recommandation'}</th>
                </tr>
              </thead>
              <tbody>
                ${pairs
                  .map((p) => {
                    const ev = evaluateWcag(p.fg, p.bg);
                    const rec = ev.aaNormal
                      ? lang === 'en'
                        ? 'Compliant for body & headings'
                        : 'Conforme corps de texte et titres'
                      : ev.aaLarge
                        ? lang === 'en'
                          ? 'Reserve for large headings (≥ 18pt)'
                          : 'Réserver aux grands titres (≥ 18pt)'
                        : lang === 'en'
                          ? 'Insufficient: darken or pair with neutral'
                          : 'Non conforme : renforcer le contraste';
                    return `<tr>
                      <td>${esc(p.label)}<div class="bb-mono" style="font-size:7pt;color:var(--bb-text-muted);">${p.fg} / ${p.bg}</div></td>
                      <td><span style="display:inline-block;padding:1.5mm 3mm;background:${p.bg};color:${p.fg};border:1px solid var(--bb-border);border-radius:3px;font-weight:600;">Aa Bb</span></td>
                      <td class="bb-mono" style="font-weight:600;">${ev.ratio.toFixed(2)}:1</td>
                      <td><span class="bb-tag" style="background:${ev.aaNormal ? '#DCFCE7' : '#FEE2E2'};color:${ev.aaNormal ? '#166534' : '#991B1B'};">${ev.aaNormal ? 'AA OK' : 'Échec'}</span></td>
                      <td><span class="bb-tag" style="background:${ev.aaaNormal ? '#DCFCE7' : '#F1F5F9'};color:${ev.aaaNormal ? '#166534' : '#475569'};">${ev.aaaNormal ? 'AAA OK' : '—'}</span></td>
                      <td style="font-size:7.8pt;color:var(--bb-text-muted);">${esc(rec)}</td>
                    </tr>`;
                  })
                  .join('')}
              </tbody>
            </table>
          </div>`
        );
      }

      case 'matrix': {
        const bgCandidates = [
          { name: 'Fond', hex: bg },
          { name: 'Surface', hex: surface },
          { name: 'Primaire', hex: primary },
          { name: 'Secondaire', hex: secondary },
          { name: 'Accent', hex: accent },
        ];
        const fgCandidates = [
          { name: 'Blanc', hex: '#FFFFFF' },
          { name: 'Texte', hex: textPrimary },
          { name: 'Primaire', hex: primary },
          { name: 'Accent', hex: accent },
        ];
        return wrapPage(
          id,
          pageNum,
          `${headingIntro(id)}
          <div class="bb-card" style="padding:3mm;">
            <table class="bb-table">
              <thead>
                <tr>
                  <th>${lang === 'en' ? 'Text \\ Background' : 'Texte \\ Fond'}</th>
                  ${bgCandidates.map((b) => `<th>${esc(b.name)} <span class="bb-mono" style="font-weight:400;">${b.hex}</span></th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${fgCandidates
                  .map(
                    (f) => `<tr>
                      <td style="font-weight:600;">${esc(f.name)}<div class="bb-mono" style="font-size:7pt;color:var(--bb-text-muted);">${f.hex}</div></td>
                      ${bgCandidates
                        .map((b) => {
                          const ev = evaluateWcag(f.hex, b.hex);
                          return `<td>
                            <div style="position:relative;overflow:hidden;background:${b.hex};color:${f.hex};padding:2mm 2.5mm;border-radius:3px;border:1px solid ${ev.aaNormal ? 'var(--bb-border)' : error};display:flex;justify-content:space-between;align-items:center;">
                              <span style="font-weight:600;font-size:8pt;">Aa</span>
                              <span class="bb-mono" style="font-size:7pt;">${ev.ratio.toFixed(1)}:1 · ${ev.aaNormal ? 'OK' : '✕'}</span>
                              ${!ev.aaNormal ? `<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;opacity:0.45;"><line x1="0" y1="100" x2="100" y2="0" stroke="${error}" stroke-width="3"/></svg>` : ''}
                            </div>
                          </td>`;
                        })
                        .join('')}
                    </tr>`
                  )
                  .join('')}
              </tbody>
            </table>
          </div>`
        );
      }

      case 'typography': {
        const families = brand.fonts.slice(0, 3);
        const roleLabel = (role: string) =>
          role === 'heading' ? 'Titres' : role === 'body' ? 'Corps de texte' : 'Données & Code';
        return wrapPage(
          id,
          pageNum,
          `${headingIntro(id)}
          <div class="bb-grid-${families.length >= 3 ? 3 : 2}">
            ${families
              .map(
                (f) => `<div class="bb-card" style="display:flex;flex-direction:column;justify-content:space-between;gap:4mm;">
                  <div>
                    <div class="bb-label">${roleLabel(f.role)} · ${f.source === 'upload' ? 'Importée' : 'Google Fonts'}</div>
                    <div style="font-family:'${esc(f.family)}',${esc(f.fallback)};font-size:28pt;font-weight:700;line-height:1.05;margin:2mm 0;">Aa Bb</div>
                    <div style="font-weight:600;font-size:10pt;">${esc(f.family)}</div>
                    <div class="bb-mono" style="font-size:7.3pt;color:var(--bb-text-muted);margin-top:1mm;">Graisses : ${f.weights.join(', ')}</div>
                  </div>
                  <div style="font-family:'${esc(f.family)}',${esc(f.fallback)};font-size:9pt;line-height:1.5;padding-top:3mm;border-top:1px solid var(--bb-border);">
                    ABCDEFGHIJKLM NOPQRSTUVWXYZ<br/>
                    abcdefghijklm nopqrstuvwxyz<br/>
                    Éàèùç € « » 0123456789
                  </div>
                  <div class="bb-mono" style="font-size:7pt;color:var(--bb-text-muted);">
                    Repli : ${esc(f.fallback)}
                  </div>
                </div>`
              )
              .join('')}
          </div>`
        );
      }

      case 'typescale': {
        const fontForRole = (role: string) => {
          const match = brand.fonts.find((f) => f.role === role);
          return match ? `'${match.family}', ${match.fallback}` : 'var(--bb-font-body)';
        };
        return wrapPage(
          id,
          pageNum,
          `${headingIntro(id)}
          <div class="bb-card" style="padding:2.5mm 4mm;">
            <table class="bb-table">
              <thead>
                <tr>
                  <th style="width:26%;">${lang === 'en' ? 'Token' : 'Niveau'}</th>
                  <th style="width:24%;">${lang === 'en' ? 'Specs' : 'Spécifications'}</th>
                  <th>${lang === 'en' ? 'Live Specimen' : 'Spécimen réel'}</th>
                </tr>
              </thead>
              <tbody>
                ${brand.typeScale.levels
                  .map(
                    (lvl) => `<tr>
                      <td style="font-weight:600;">${esc(lvl.label)}</td>
                      <td class="bb-mono" style="font-size:7.5pt;color:var(--bb-text-muted);">${lvl.sizePx}px · ${lvl.weight} · lh ${lvl.lineHeight}</td>
                      <td>
                        <div style="font-family:${fontForRole(lvl.role)};font-size:${Math.min(lvl.sizePx, 28)}px;font-weight:${lvl.weight};line-height:${lvl.lineHeight};letter-spacing:${lvl.letterSpacingEm}em;">
                          ${esc(brand.name)} — ${lvl.key.toUpperCase()}
                        </div>
                      </td>
                    </tr>`
                  )
                  .join('')}
              </tbody>
            </table>
          </div>`
        );
      }

      case 'grid': {
        const g = brand.gridConfig;
        const cols = Math.min(12, Math.max(4, g.columns));
        return wrapPage(
          id,
          pageNum,
          `${headingIntro(id)}
          <div class="bb-grid-2">
            <div class="bb-card">
              <div class="bb-label">${cols} ${lang === 'en' ? 'Columns Grid' : 'Colonnes'} · ${g.containerMaxPx}px max · ${g.gutterPx}px ${lang === 'en' ? 'gutter' : 'gouttière'}</div>
              <div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:2mm;height:36mm;margin-top:3mm;">
                ${Array.from({ length: cols })
                  .map(() => `<div style="background:rgba(24,43,73,0.1);border:1px solid var(--bb-border);border-radius:2px;"></div>`)
                  .join('')}
              </div>
              <div class="bb-mono" style="display:flex;gap:3mm;margin-top:4mm;font-size:7.5pt;color:var(--bb-text-muted);">
                ${[1, 2, 3, 4, 6].map((m) => `<span>${m * g.baseSpacingPx}px</span>`).join(' · ')}
              </div>
            </div>
            <div class="bb-card">
              <div class="bb-label">${lang === 'en' ? 'Radii & Elevation' : 'Rayons & Élévations'}</div>
              <div class="bb-grid-3" style="margin-top:3mm;">
                <div style="padding:4mm;border:1px solid var(--bb-border);border-radius:${g.radiusSmPx}px;background:#FFFFFF;text-align:center;">
                  <div style="font-weight:600;font-size:8.5pt;">SM</div>
                  <div class="bb-mono" style="font-size:7.5pt;color:var(--bb-text-muted);">${g.radiusSmPx}px</div>
                </div>
                <div style="padding:4mm;border:1px solid var(--bb-border);border-radius:${g.radiusMdPx}px;background:#FFFFFF;text-align:center;">
                  <div style="font-weight:600;font-size:8.5pt;">MD</div>
                  <div class="bb-mono" style="font-size:7.5pt;color:var(--bb-text-muted);">${g.radiusMdPx}px</div>
                </div>
                <div style="padding:4mm;border:1px solid var(--bb-border);border-radius:${g.radiusLgPx}px;background:#FFFFFF;text-align:center;box-shadow:0 6px 16px rgba(15,23,42,0.08);">
                  <div style="font-weight:600;font-size:8.5pt;">LG</div>
                  <div class="bb-mono" style="font-size:7.5pt;color:var(--bb-text-muted);">${g.radiusLgPx}px</div>
                </div>
              </div>
            </div>
          </div>`
        );
      }

      case 'iconography': {
        const sw = brand.iconConfig.strokeWidth || 1.75;
        const cap = brand.iconConfig.cornerStyle === 'sharp' ? 'square' : 'round';
        const icons = [
          { name: 'Compass', d: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>' },
          { name: 'Layers', d: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>' },
          { name: 'ShieldCheck', d: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>' },
          { name: 'Palette', d: '<circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>' },
          { name: 'Type', d: '<polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>' },
          { name: 'FileText', d: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>' },
          { name: 'Sparkles', d: '<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>' },
          { name: 'Download', d: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>' },
        ];
        return wrapPage(
          id,
          pageNum,
          `${headingIntro(id)}
          <div class="bb-card">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4mm;">
              <span class="bb-label" style="margin:0;">Style : ${esc(brand.iconConfig.style)} · Épaisseur : ${sw}px · Terminaison : ${cap}</span>
              <span class="bb-mono" style="font-size:7.8pt;color:var(--bb-text-muted);">Grille 24 × 24 px</span>
            </div>
            <div class="bb-grid-4">
              ${icons
                .map(
                  (ic, idx) => `<div style="border:1px solid var(--bb-border);border-radius:var(--bb-radius-sm);padding:3.5mm;display:flex;align-items:center;gap:3mm;background:#FFFFFF;">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${idx % 2 === 0 ? primary : accent}" stroke-width="${sw}" stroke-linecap="${cap}" stroke-linejoin="${cap}">${ic.d}</svg>
                    <span class="bb-mono" style="font-size:7.8pt;">${ic.name}</span>
                  </div>`
                )
                .join('')}
            </div>
          </div>`
        );
      }

      case 'components': {
        return wrapPage(
          id,
          pageNum,
          `${headingIntro(id)}
          <div class="bb-grid-2">
            <div class="bb-card" style="display:flex;flex-direction:column;gap:4mm;">
              <div class="bb-label">${lang === 'en' ? 'Buttons & Badges' : 'Boutons & Statuts'}</div>
              <div style="display:flex;flex-wrap:wrap;gap:2.5mm;align-items:center;">
                <span style="background:${primary};color:${onPrimary};padding:2.2mm 4.5mm;border-radius:var(--bb-radius-sm);font-size:8.5pt;font-weight:600;">Action principale</span>
                <span style="background:${secondary};color:${getContrastText(secondary)};padding:2.2mm 4.5mm;border-radius:var(--bb-radius-sm);font-size:8.5pt;font-weight:600;">Survol</span>
                <span style="background:transparent;color:${primary};border:1px solid ${primary};padding:2mm 4mm;border-radius:var(--bb-radius-sm);font-size:8.5pt;font-weight:600;">Secondaire</span>
              </div>
              <div style="display:flex;gap:2mm;">
                <span class="bb-tag" style="background:${success};color:${getContrastText(success)};">Validé</span>
                <span class="bb-tag" style="background:${warning};color:${getContrastText(warning)};">Attention</span>
                <span class="bb-tag" style="background:${error};color:${getContrastText(error)};">Erreur</span>
              </div>
              <div>
                <div class="bb-label">Champ de saisie</div>
                <div style="border:1px solid ${border};background:#FFFFFF;padding:2.2mm 3mm;border-radius:var(--bb-radius-sm);font-size:8.5pt;color:var(--bb-text-muted);">contact@${esc(brand.name.toLowerCase().replace(/\s+/g, ''))}.fr</div>
              </div>
            </div>
            <div class="bb-card" style="display:flex;flex-direction:column;gap:3.5mm;">
              <div class="bb-label">${lang === 'en' ? 'Cards & Tooltip' : 'Cartes & Infobulle'}</div>
              <div style="padding:3.5mm;border:1px solid ${border};border-radius:var(--bb-radius-md);background:#FFFFFF;">
                <div style="font-family:var(--bb-font-heading);font-weight:600;font-size:9.5pt;">Carte standard</div>
                <div style="font-size:8pt;color:var(--bb-text-muted);margin-top:1mm;">Conteneur par défaut avec filet subtil.</div>
              </div>
              <div style="padding:3.5mm;border:2px solid ${accent};border-radius:var(--bb-radius-md);background:${surface};">
                <div style="font-family:var(--bb-font-heading);font-weight:600;font-size:9.5pt;color:${primary};">Carte sélectionnée</div>
                <div style="font-size:8pt;color:var(--bb-text-muted);margin-top:1mm;">Mise en avant par bordure d’accent.</div>
              </div>
              <div style="align-self:flex-start;background:${textPrimary};color:#FFFFFF;padding:1.8mm 3mm;border-radius:var(--bb-radius-sm);font-size:7.5pt;">
                Infobulle · Contraste maximal
              </div>
            </div>
          </div>`
        );
      }

      case 'documents': {
        return wrapPage(
          id,
          pageNum,
          `${headingIntro(id)}
          <div class="bb-grid-2">
            <div class="bb-card" style="background:#FFFFFF;display:flex;flex-direction:column;justify-content:space-between;min-height:85mm;">
              <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid ${primary};padding-bottom:3mm;">
                <img src="${primaryLogo}" alt="" style="max-height:10mm;object-fit:contain;" />
                <span class="bb-mono" style="font-size:7.2pt;color:var(--bb-text-muted);">PROPOSITION · 2026</span>
              </div>
              <div style="margin:6mm 0;">
                <div style="font-size:7.5pt;color:${accent};font-weight:600;">DOSSIER STRATÉGIQUE</div>
                <div style="font-family:var(--bb-font-heading);font-size:15pt;font-weight:700;margin-top:1.5mm;">Rapport Annuel & Vision</div>
                <div style="font-size:8.2pt;color:var(--bb-text-muted);margin-top:2mm;">Document type respectant les marges, la hiérarchie de titres et la signature chromatique.</div>
              </div>
              <div style="border-top:1px solid ${border};padding-top:2.5mm;font-size:7pt;color:var(--bb-text-muted);display:flex;justify-content:space-between;">
                <span>${esc(brand.name)}</span><span>Page 01</span>
              </div>
            </div>
            <div class="bb-card" style="background:#FFFFFF;">
              <div class="bb-label">${lang === 'en' ? 'Branded Data Table' : 'Tableau analytique type'}</div>
              <table class="bb-table" style="margin-top:2mm;">
                <thead>
                  <tr style="background:${surface};"><th>Indicateur</th><th>Q1</th><th>Q2</th><th>Statut</th></tr>
                </thead>
                <tbody>
                  <tr><td>Adoption Design System</td><td class="bb-mono">78 %</td><td class="bb-mono">94 %</td><td><span class="bb-tag" style="background:#DCFCE7;color:#166534;">Conforme</span></td></tr>
                  <tr><td>Conformité WCAG AA</td><td class="bb-mono">91 %</td><td class="bb-mono">100 %</td><td><span class="bb-tag" style="background:#DCFCE7;color:#166534;">Validé</span></td></tr>
                  <tr><td>Couverture Print</td><td class="bb-mono">64 %</td><td class="bb-mono">88 %</td><td><span class="bb-tag" style="background:${surface};color:${primary};">En cours</span></td></tr>
                </tbody>
              </table>
            </div>
          </div>`
        );
      }

      case 'tokens': {
        const cssSnippet = buildTokensCss(brand).split('\n').slice(0, 28).join('\n');
        return wrapPage(
          id,
          pageNum,
          `${headingIntro(id)}
          <div class="bb-card" style="background:#0F172A;color:#E2E8F0;font-family:var(--bb-font-mono);font-size:7.6pt;line-height:1.48;white-space:pre-wrap;overflow:hidden;">${esc(cssSnippet)}\n  /* ... pack complet dans tokens.css & brand.json */</div>`
        );
      }

      case 'checklist': {
        const checks = [
          lang === 'en' ? 'Primary & monochrome SVG/PNG logos verified' : 'Logotypes vectoriels (SVG) et négatifs validés',
          lang === 'en' ? 'Clear space & minimum sizes respected' : 'Zone de protection et tailles minimales respectées',
          lang === 'en' ? 'WCAG AA contrast ≥ 4.5:1 on all text pairings' : 'Contrastes WCAG AA ≥ 4,5:1 vérifiés sur chaque paire texte/fond',
          lang === 'en' ? 'Font licenses confirmed and WOFF2 embedded' : 'Licences typographiques confirmées et WOFF2 embarqués',
          lang === 'en' ? 'Design tokens exported (CSS, Tailwind, JSON)' : 'Design tokens synchronisés (tokens.css, Tailwind, brand.json)',
          lang === 'en' ? 'Pre-press CMYK proof checked for print pieces' : 'Épreuvage CMJN indicatif contrôlé avant impression',
        ];
        return wrapPage(
          id,
          pageNum,
          `${headingIntro(id)}
          <div class="bb-grid-2">
            ${checks
              .map(
                (item, i) => `<div class="bb-card" style="display:flex;align-items:center;gap:3mm;">
                  <span class="bb-mono" style="width:6.5mm;height:6.5mm;border-radius:50%;background:${primary};color:${onPrimary};display:inline-flex;align-items:center;justify-content:center;font-size:8pt;font-weight:600;flex-shrink:0;">✓</span>
                  <div>
                    <div class="bb-mono" style="font-size:7pt;color:var(--bb-text-muted);">POINT 0${i + 1}</div>
                    <div style="font-size:8.8pt;font-weight:500;">${esc(item)}</div>
                  </div>
                </div>`
              )
              .join('')}
          </div>`
        );
      }
    }
  };

  const targetSections = options.singlePageId
    ? activeSections.filter((s) => s.id === options.singlePageId)
    : activeSections;

  const pages: RenderedPage[] = targetSections.map((s) => {
    const pageNum = pageNumberMap.get(s.id) ?? 1;
    return {
      id: s.id,
      title: lang === 'en' ? s.titleEn : s.titleFr,
      pageNumber: pageNum,
      html: renderSectionContent(s.id, pageNum),
    };
  });

  return {
    css: buildDocumentCss(brand, format),
    fontHeadHtml: getGoogleFontLinksHtml(brand.fonts),
    pages,
  };
}

export function renderBrandBookDocument(
  brand: BrandBookData,
  options: RenderOptions = {}
): string {
  const { css, fontHeadHtml, pages } = renderBrandBookPages(brand, options);
  return `<!doctype html>
<html lang="${brand.language === 'en' ? 'en' : 'fr'}">
<head>
  <meta charset="UTF-8" />
  <title>${esc(brand.name)} — Charte graphique</title>
  ${fontHeadHtml}
  <style>${css}</style>
</head>
<body>
  ${pages.map((p) => p.html).join('\n')}
</body>
</html>`;
}
