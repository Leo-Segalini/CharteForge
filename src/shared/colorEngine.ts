import type {
  BrandBookData,
  ColorTokenData,
  GradientSpec,
} from './types.ts';

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface HslColor {
  h: number;
  s: number;
  l: number;
}

export interface CmykColor {
  c: number;
  m: number;
  y: number;
  k: number;
}

export interface ColorShade {
  step: number;
  hex: string;
}

export interface WcagEvaluation {
  ratio: number;
  aaNormal: boolean;
  aaLarge: boolean;
  aaaNormal: boolean;
  aaaLarge: boolean;
  levelLabel: 'AAA' | 'AA' | 'AA Large' | 'Insuffisant';
}

export function normalizeHex(input: string): string {
  const cleaned = input.trim().replace(/^#/, '').toUpperCase();
  if (/^[0-9A-F]{3}$/.test(cleaned)) {
    return (
      '#' +
      cleaned
        .split('')
        .map((c) => c + c)
        .join('')
    );
  }
  if (/^[0-9A-F]{6}$/.test(cleaned)) {
    return '#' + cleaned;
  }
  return '#0F172A';
}

export function isValidHex(input: string): boolean {
  return /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(input.trim());
}

export function hexToRgb(hex: string): RgbColor {
  const norm = normalizeHex(hex).slice(1);
  return {
    r: parseInt(norm.slice(0, 2), 16),
    g: parseInt(norm.slice(2, 4), 16),
    b: parseInt(norm.slice(4, 6), 16),
  };
}

export function rgbToHex({ r, g, b }: RgbColor): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return (
    '#' +
    [clamp(r), clamp(g), clamp(b)]
      .map((v) => v.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

export function hexToHsl(hex: string): HslColor {
  const { r, g, b } = hexToRgb(hex);
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0);
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      default:
        h = (rn - gn) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hslToHex({ h, s, l }: HslColor): string {
  const sn = Math.max(0, Math.min(100, s)) / 100;
  const ln = Math.max(0, Math.min(100, l)) / 100;
  const hn = ((h % 360) + 360) % 360;

  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((hn / 60) % 2) - 1));
  const m = ln - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (hn < 60) {
    r = c;
    g = x;
  } else if (hn < 120) {
    r = x;
    g = c;
  } else if (hn < 180) {
    g = c;
    b = x;
  } else if (hn < 240) {
    g = x;
    b = c;
  } else if (hn < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  return rgbToHex({
    r: (r + m) * 255,
    g: (g + m) * 255,
    b: (b + m) * 255,
  });
}

export function hexToCmyk(hex: string): CmykColor {
  const { r, g, b } = hexToRgb(hex);
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const k = 1 - Math.max(rn, gn, bn);
  if (k >= 0.999) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }
  const c = ((1 - rn - k) / (1 - k)) * 100;
  const m = ((1 - gn - k) / (1 - k)) * 100;
  const y = ((1 - bn - k) / (1 - k)) * 100;
  return {
    c: Math.round(c),
    m: Math.round(m),
    y: Math.round(y),
    k: Math.round(k * 100),
  };
}

export function mixHex(hexA: string, hexB: string, weightA: number): string {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const w = Math.max(0, Math.min(1, weightA));
  return rgbToHex({
    r: a.r * w + b.r * (1 - w),
    g: a.g * w + b.g * (1 - w),
    b: a.b * w + b.b * (1 - w),
  });
}

export function generateShades(hex: string): ColorShade[] {
  const base = normalizeHex(hex);
  const steps: Array<{ step: number; hex: string }> = [
    { step: 100, hex: mixHex(base, '#FFFFFF', 0.14) },
    { step: 200, hex: mixHex(base, '#FFFFFF', 0.28) },
    { step: 300, hex: mixHex(base, '#FFFFFF', 0.46) },
    { step: 400, hex: mixHex(base, '#FFFFFF', 0.72) },
    { step: 500, hex: base },
    { step: 600, hex: mixHex(base, '#000000', 0.84) },
    { step: 700, hex: mixHex(base, '#000000', 0.66) },
    { step: 800, hex: mixHex(base, '#000000', 0.48) },
    { step: 900, hex: mixHex(base, '#000000', 0.30) },
  ];
  return steps;
}

export function getRelativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function getContrastRatio(hexA: string, hexB: string): number {
  const lumA = getRelativeLuminance(hexA);
  const lumB = getRelativeLuminance(hexB);
  const brightest = Math.max(lumA, lumB);
  const darkest = Math.min(lumA, lumB);
  return Number(((brightest + 0.05) / (darkest + 0.05)).toFixed(2));
}

export function evaluateWcag(fgHex: string, bgHex: string): WcagEvaluation {
  const ratio = getContrastRatio(fgHex, bgHex);
  const aaNormal = ratio >= 4.5;
  const aaLarge = ratio >= 3.0;
  const aaaNormal = ratio >= 7.0;
  const aaaLarge = ratio >= 4.5;

  let levelLabel: WcagEvaluation['levelLabel'] = 'Insuffisant';
  if (aaaNormal) levelLabel = 'AAA';
  else if (aaNormal) levelLabel = 'AA';
  else if (aaLarge) levelLabel = 'AA Large';

  return {
    ratio,
    aaNormal,
    aaLarge,
    aaaNormal,
    aaaLarge,
    levelLabel,
  };
}

export function getContrastText(bgHex: string, lightHex = '#FFFFFF', darkHex = '#0F172A'): string {
  const ratioLight = getContrastRatio(lightHex, bgHex);
  const ratioDark = getContrastRatio(darkHex, bgHex);
  return ratioLight >= ratioDark ? lightHex : darkHex;
}

export function suggestAccessibleForeground(fgHex: string, bgHex: string, targetRatio = 4.5): string {
  if (getContrastRatio(fgHex, bgHex) >= targetRatio) {
    return normalizeHex(fgHex);
  }
  const hsl = hexToHsl(fgHex);
  const bgLum = getRelativeLuminance(bgHex);
  const direction = bgLum > 0.35 ? -1 : 1;

  for (let i = 1; i <= 20; i++) {
    const candidateL = Math.max(4, Math.min(96, hsl.l + direction * i * 5));
    const candidate = hslToHex({ h: hsl.h, s: hsl.s, l: candidateL });
    if (getContrastRatio(candidate, bgHex) >= targetRatio) {
      return candidate;
    }
  }
  return getContrastText(bgHex);
}

export function getColorByRole(
  colors: ColorTokenData[],
  role: string,
  fallback: string
): string {
  const found = colors.find((c) => c.role === role);
  return found ? normalizeHex(found.hex) : fallback;
}

export function generateSignatureGradients(colors: ColorTokenData[]): GradientSpec[] {
  const primary = getColorByRole(colors, 'primary', '#1E293B');
  const secondary = getColorByRole(colors, 'secondary', '#334155');
  const accent = getColorByRole(colors, 'accent', mixHex(primary, '#FFFFFF', 0.65));

  return [
    {
      id: 'grad-signature-1',
      name: 'Dégradé Signature Principal',
      angle: 135,
      fromHex: primary,
      toHex: secondary,
    },
    {
      id: 'grad-signature-2',
      name: 'Dégradé Éclat & Accent',
      angle: 120,
      fromHex: secondary,
      toHex: accent,
    },
  ];
}

export function buildTokensCss(brand: BrandBookData): string {
  const primary = getColorByRole(brand.colors, 'primary', '#1B365D');
  const secondary = getColorByRole(brand.colors, 'secondary', '#3A6B8C');
  const accent = getColorByRole(brand.colors, 'accent', '#D97706');
  const bg = getColorByRole(brand.colors, 'background', '#FFFFFF');
  const surface = getColorByRole(brand.colors, 'surface', '#F8FAFC');
  const textPrimary = getColorByRole(brand.colors, 'text_primary', '#0F172A');
  const textSecondary = getColorByRole(brand.colors, 'text_secondary', '#475569');
  const border = getColorByRole(brand.colors, 'border', '#E2E8F0');

  const headingFont = brand.fonts.find((f) => f.role === 'heading');
  const bodyFont = brand.fonts.find((f) => f.role === 'body');
  const monoFont = brand.fonts.find((f) => f.role === 'mono');

  const fontFaces = brand.fonts
    .filter((f) => f.source === 'upload' && f.woff2DataUrl)
    .map(
      (f) => `@font-face {
  font-family: '${f.family}';
  src: url('./fonts/${slugify(f.family)}.woff2') format('woff2');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}`
    )
    .join('\n\n');

  const colorLines = brand.colors
    .map((c) => `  --color-${slugify(c.role || c.name)}: ${normalizeHex(c.hex)};`)
    .join('\n');

  const primaryShades = generateShades(primary)
    .map((s) => `  --color-primary-${s.step}: ${s.hex};`)
    .join('\n');

  const grad1 = brand.gradients[0];
  const grad2 = brand.gradients[1];

  const typeLines = brand.typeScale.levels
    .map(
      (lvl) =>
        `  --text-${lvl.key}-size: ${lvl.sizePx}px;\n  --text-${lvl.key}-lh: ${lvl.lineHeight};`
    )
    .join('\n');

  return `${fontFaces ? fontFaces + '\n\n' : ''}:root {
  /* Palette de marque — ${brand.name} */
${colorLines}
  --color-primary-fallback: ${primary};
  --color-secondary-fallback: ${secondary};
  --color-accent-fallback: ${accent};
  --color-bg-fallback: ${bg};
  --color-surface-fallback: ${surface};
  --color-text-fallback: ${textPrimary};
  --color-text-muted-fallback: ${textSecondary};
  --color-border-fallback: ${border};

  /* Nuances primaires */
${primaryShades}

  /* Dégradés signatures */
  --gradient-signature-1: linear-gradient(${grad1?.angle ?? 135}deg, ${grad1?.fromHex ?? primary}, ${grad1?.toHex ?? secondary});
  --gradient-signature-2: linear-gradient(${grad2?.angle ?? 120}deg, ${grad2?.fromHex ?? secondary}, ${grad2?.toHex ?? accent});

  /* Typographie */
  --font-heading: '${headingFont?.family ?? 'Plus Jakarta Sans'}', ${headingFont?.fallback ?? 'sans-serif'};
  --font-body: '${bodyFont?.family ?? 'Public Sans'}', ${bodyFont?.fallback ?? 'sans-serif'};
  --font-mono: '${monoFont?.family ?? 'JetBrains Mono'}', ${monoFont?.fallback ?? 'monospace'};

  /* Échelle typographique */
${typeLines}

  /* Grille & Rayons */
  --container-max: ${brand.gridConfig.containerMaxPx}px;
  --grid-columns: ${brand.gridConfig.columns};
  --grid-gutter: ${brand.gridConfig.gutterPx}px;
  --radius-sm: ${brand.gridConfig.radiusSmPx}px;
  --radius-md: ${brand.gridConfig.radiusMdPx}px;
  --radius-lg: ${brand.gridConfig.radiusLgPx}px;
}
`;
}

export function buildTailwindConfigJs(brand: BrandBookData): string {
  const colorEntries = brand.colors
    .map((c) => `        '${slugify(c.role || c.name)}': '${normalizeHex(c.hex)}',`)
    .join('\n');

  const heading = brand.fonts.find((f) => f.role === 'heading');
  const body = brand.fonts.find((f) => f.role === 'body');
  const mono = brand.fonts.find((f) => f.role === 'mono');

  return `/** @type {import('tailwindcss').Config} */
// Design tokens générés automatiquement pour ${brand.name}
export default {
  theme: {
    extend: {
      colors: {
${colorEntries}
      },
      fontFamily: {
        heading: ["'${heading?.family ?? 'Plus Jakarta Sans'}'", '${heading?.fallback ?? 'sans-serif'}'],
        body: ["'${body?.family ?? 'Public Sans'}'", '${body?.fallback ?? 'sans-serif'}'],
        mono: ["'${mono?.family ?? 'JetBrains Mono'}'", '${mono?.fallback ?? 'monospace'}'],
      },
      borderRadius: {
        sm: '${brand.gridConfig.radiusSmPx}px',
        md: '${brand.gridConfig.radiusMdPx}px',
        lg: '${brand.gridConfig.radiusLgPx}px',
      },
      maxWidth: {
        brand: '${brand.gridConfig.containerMaxPx}px',
      },
    },
  },
};
`;
}

export function buildBrandJson(brand: BrandBookData): string {
  const tokens = {
    $schema: 'https://tr.designtokens.org/format/',
    brand: {
      name: brand.name,
      baseline: brand.baseline,
      sector: brand.sector,
      language: brand.language,
      version: brand.guideline.version,
    },
    color: Object.fromEntries(
      brand.colors.map((c) => [
        slugify(c.role || c.name),
        {
          $value: normalizeHex(c.hex),
          $type: 'color',
          name: c.name,
          role: c.role,
          rgb: hexToRgb(c.hex),
          hsl: hexToHsl(c.hex),
          cmyk: hexToCmyk(c.hex),
          shades: Object.fromEntries(
            generateShades(c.hex).map((s) => [String(s.step), s.hex])
          ),
        },
      ])
    ),
    gradient: brand.gradients,
    typography: {
      families: brand.fonts.map((f) => ({
        role: f.role,
        family: f.family,
        weights: f.weights,
        fallback: f.fallback,
      })),
      scale: brand.typeScale.levels,
    },
    layout: brand.gridConfig,
    iconography: brand.iconConfig,
    logoProtection: brand.protectionConfig,
  };

  return JSON.stringify(tokens, null, 2);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'token';
}
