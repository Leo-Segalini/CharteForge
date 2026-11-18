import type {
  BrandBookData,
  DocumentLanguage,
  SectionId,
  TypeScaleConfig,
  TypeScalePreset,
} from '../types.ts';

export interface SectionDefinition {
  id: SectionId;
  titleFr: string;
  titleEn: string;
  defaultCopyFr: string;
  defaultCopyEn: string;
}

export const ALL_SECTIONS: SectionDefinition[] = [
  {
    id: 'cover',
    titleFr: 'Couverture',
    titleEn: 'Cover',
    defaultCopyFr: 'Charte graphique & Design System officiel.',
    defaultCopyEn: 'Official Brand Guidelines & Design System.',
  },
  {
    id: 'toc',
    titleFr: 'Sommaire',
    titleEn: 'Table of Contents',
    defaultCopyFr: 'Structure complète des règles visuelles, typographiques et numériques.',
    defaultCopyEn: 'Complete structure of visual, typographic, and digital standards.',
  },
  {
    id: 'identity',
    titleFr: 'Identité de marque',
    titleEn: 'Brand Identity',
    defaultCopyFr:
      'Notre identité exprime notre positionnement stratégique, notre promesse client et nos principes directeurs sur chaque point de contact.',
    defaultCopyEn:
      'Our identity expresses our strategic positioning, customer promise, and guiding principles across every touchpoint.',
  },
  {
    id: 'logotype',
    titleFr: 'Logotype et déclinaisons',
    titleEn: 'Logotype & Variants',
    defaultCopyFr:
      'Le logotype est l’élément central de reconnaissance. Utilisez exclusivement les déclinaisons officielles fournies selon le support.',
    defaultCopyEn:
      'The logotype is our core mark of recognition. Only use the official variants provided according to the medium.',
  },
  {
    id: 'clearspace',
    titleFr: 'Zone de protection et tailles minimales',
    titleEn: 'Clear Space & Minimum Sizes',
    defaultCopyFr:
      'Une zone d’exclusion proportionnelle garantit la lisibilité et l’impact visuel du logotype face aux éléments adjacents.',
    defaultCopyEn:
      'A proportional exclusion zone ensures legibility and visual impact around the logotype against adjacent elements.',
  },
  {
    id: 'misuse',
    titleFr: 'Usages interdits du logo',
    titleEn: 'Logo Misuse',
    defaultCopyFr:
      'Toute altération de géométrie, de couleur, d’effet ou de contraste compromet l’intégrité de la marque et demeure proscrite.',
    defaultCopyEn:
      'Any alteration of geometry, color, effects, or contrast compromises brand integrity and is strictly prohibited.',
  },
  {
    id: 'palette',
    titleFr: 'Palette chromatique',
    titleEn: 'Color Palette',
    defaultCopyFr:
      'La palette définit les teintes officielles et leurs correspondances exactes pour les environnements numériques (HEX, RGB) et imprimés (CMJN indicatif).',
    defaultCopyEn:
      'The palette defines official hues and exact values for digital (HEX, RGB) and print (indicative CMYK) environments.',
  },
  {
    id: 'balance',
    titleFr: 'Équilibre des teintes et dégradés',
    titleEn: 'Color Balance & Gradients',
    defaultCopyFr:
      'La règle 60-30-10 structure la hiérarchie visuelle : 60 % de fonds neutres, 30 % de surfaces structurelles et 10 % d’accents.',
    defaultCopyEn:
      'The 60-30-10 rule structures visual hierarchy: 60% neutral canvas, 30% structural surfaces, and 10% focal accents.',
  },
  {
    id: 'accessibility',
    titleFr: 'Accessibilité WCAG 2.1',
    titleEn: 'WCAG 2.1 Accessibility',
    defaultCopyFr:
      'Chaque association texte/fond est évaluée selon les critères WCAG 2.1 (AA ≥ 4,5:1 et AAA ≥ 7,0:1) afin de garantir une lecture universelle.',
    defaultCopyEn:
      'Every text/background pairing is evaluated against WCAG 2.1 criteria (AA ≥ 4.5:1 and AAA ≥ 7.0:1) to ensure universal legibility.',
  },
  {
    id: 'matrix',
    titleFr: 'Combinaisons texte / fond',
    titleEn: 'Text & Surface Matrix',
    defaultCopyFr:
      'Matrice exhaustive des associations chromatiques autorisées et déconseillées dans les interfaces et supports éditoriaux.',
    defaultCopyEn:
      'Comprehensive matrix of approved and discouraged color pairings across interfaces and editorial layouts.',
  },
  {
    id: 'typography',
    titleFr: 'Typographie',
    titleEn: 'Typography',
    defaultCopyFr:
      'Les familles typographiques sélectionnées confèrent à la marque sa voix éditoriale, sa précision technique et sa lisibilité.',
    defaultCopyEn:
      'The selected type families give the brand its editorial voice, technical precision, and reading comfort.',
  },
  {
    id: 'typescale',
    titleFr: 'Échelle typographique',
    titleEn: 'Type Scale',
    defaultCopyFr:
      'Hiérarchie calibrée des corps, graisses, interlignes et lettrages assurant le rythme vertical sur tous les écrans.',
    defaultCopyEn:
      'Calibrated hierarchy of sizes, weights, line heights, and tracking ensuring vertical rhythm across all screens.',
  },
  {
    id: 'grid',
    titleFr: 'Grille, espacements et surfaces',
    titleEn: 'Grid, Spacing & Surfaces',
    defaultCopyFr:
      'Système de mise en page modulaire définissant la largeur de conteneur, les colonnes, les rayons de courbure et l’élévation.',
    defaultCopyEn:
      'Modular layout system defining container width, columns, corner radii, and surface elevation.',
  },
  {
    id: 'iconography',
    titleFr: 'Iconographie',
    titleEn: 'Iconography',
    defaultCopyFr:
      'Les icônes adoptent un tracé géométrique constant, aligné sur l’épaisseur et la personnalité de la typographie.',
    defaultCopyEn:
      'Icons follow a consistent geometric stroke weight aligned with the personality of the brand typography.',
  },
  {
    id: 'components',
    titleFr: 'Composants UI',
    titleEn: 'UI Components',
    defaultCopyFr:
      'Bibliothèque de composants applicatifs prêts à l’emploi respectant strictement les jetons de couleur, rayons et contrastes.',
    defaultCopyEn:
      'Production-ready application components strictly adhering to brand color tokens, radii, and contrast rules.',
  },
  {
    id: 'documents',
    titleFr: 'Documents types',
    titleEn: 'Document Templates',
    defaultCopyFr:
      'Exemples concrets de mise en application sur une page de garde officielle et un tableau analytique structuré.',
    defaultCopyEn:
      'Practical application examples featuring an official cover page and a structured analytical data table.',
  },
  {
    id: 'tokens',
    titleFr: 'Design tokens',
    titleEn: 'Design Tokens',
    defaultCopyFr:
      'Variables CSS et règles d’importation prêtes à être intégrées directement dans les projets web et systèmes de design.',
    defaultCopyEn:
      'CSS custom properties and font import rules ready for direct integration into web apps and design systems.',
  },
  {
    id: 'checklist',
    titleFr: 'Check-list de conformité',
    titleEn: 'Compliance Checklist',
    defaultCopyFr:
      'Points de contrôle obligatoires à valider avant toute diffusion imprimée ou mise en production numérique.',
    defaultCopyEn:
      'Mandatory verification steps required before print release or digital deployment.',
  },
];

export {
  GOOGLE_FONTS_CATALOG,
  searchGoogleFonts,
  guessFallback,
} from '../googleFontsCatalog.ts';
export type { GoogleFontEntry, GoogleFontCategory } from '../googleFontsCatalog.ts';

export function buildTypeScalePreset(preset: TypeScalePreset): TypeScaleConfig {
  if (preset === 'compact') {
    return {
      preset: 'compact',
      levels: [
        { key: 'h1', label: 'Titre principal (H1)', sizePx: 34, lineHeight: 1.12, weight: '700', letterSpacingEm: -0.02, role: 'heading' },
        { key: 'h2', label: 'Titre de section (H2)', sizePx: 24, lineHeight: 1.2, weight: '600', letterSpacingEm: -0.015, role: 'heading' },
        { key: 'h3', label: 'Sous-titre (H3)', sizePx: 18, lineHeight: 1.3, weight: '600', letterSpacingEm: -0.01, role: 'heading' },
        { key: 'body', label: 'Corps de texte', sizePx: 14, lineHeight: 1.5, weight: '400', letterSpacingEm: 0, role: 'body' },
        { key: 'label', label: 'Libellé UI / Bouton', sizePx: 12, lineHeight: 1.25, weight: '600', letterSpacingEm: 0.01, role: 'body' },
        { key: 'caption', label: 'Légende / Métadonnée', sizePx: 11, lineHeight: 1.35, weight: '400', letterSpacingEm: 0.01, role: 'mono' },
      ],
    };
  }
  if (preset === 'airy') {
    return {
      preset: 'airy',
      levels: [
        { key: 'h1', label: 'Titre principal (H1)', sizePx: 48, lineHeight: 1.08, weight: '700', letterSpacingEm: -0.025, role: 'heading' },
        { key: 'h2', label: 'Titre de section (H2)', sizePx: 32, lineHeight: 1.15, weight: '600', letterSpacingEm: -0.02, role: 'heading' },
        { key: 'h3', label: 'Sous-titre (H3)', sizePx: 22, lineHeight: 1.28, weight: '600', letterSpacingEm: -0.01, role: 'heading' },
        { key: 'body', label: 'Corps de texte', sizePx: 16, lineHeight: 1.65, weight: '400', letterSpacingEm: 0, role: 'body' },
        { key: 'label', label: 'Libellé UI / Bouton', sizePx: 14, lineHeight: 1.3, weight: '600', letterSpacingEm: 0.01, role: 'body' },
        { key: 'caption', label: 'Légende / Métadonnée', sizePx: 12, lineHeight: 1.45, weight: '400', letterSpacingEm: 0.02, role: 'mono' },
      ],
    };
  }
  return {
    preset: 'balanced',
    levels: [
      { key: 'h1', label: 'Titre principal (H1)', sizePx: 40, lineHeight: 1.1, weight: '700', letterSpacingEm: -0.02, role: 'heading' },
      { key: 'h2', label: 'Titre de section (H2)', sizePx: 28, lineHeight: 1.18, weight: '600', letterSpacingEm: -0.015, role: 'heading' },
      { key: 'h3', label: 'Sous-titre (H3)', sizePx: 20, lineHeight: 1.3, weight: '600', letterSpacingEm: -0.01, role: 'heading' },
      { key: 'body', label: 'Corps de texte', sizePx: 15, lineHeight: 1.55, weight: '400', letterSpacingEm: 0, role: 'body' },
      { key: 'label', label: 'Libellé UI / Bouton', sizePx: 13, lineHeight: 1.3, weight: '600', letterSpacingEm: 0.01, role: 'body' },
      { key: 'caption', label: 'Légende / Métadonnée', sizePx: 12, lineHeight: 1.4, weight: '400', letterSpacingEm: 0.01, role: 'mono' },
    ],
  };
}

export function getDefaultSectionCopy(lang: DocumentLanguage): Record<string, string> {
  const map: Record<string, string> = {};
  for (const s of ALL_SECTIONS) {
    map[s.id] = lang === 'en' ? s.defaultCopyEn : s.defaultCopyFr;
  }
  return map;
}

function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

const DEMO_SVG_PRIMARY = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 110" width="360" height="110">
  <g fill="none" fill-rule="evenodd">
    <rect x="8" y="12" width="68" height="68" rx="16" fill="#182B49"/>
    <path d="M42 24L60 66H51L47.5 57H36.5L33 66H24L42 24ZM42 37L38.5 49H45.5L42 37Z" fill="#FFFFFF"/>
    <circle cx="62" cy="26" r="5" fill="#C97B36"/>
    <text x="94" y="48" font-family="Plus Jakarta Sans, sans-serif" font-size="30" font-weight="700" letter-spacing="-0.5" fill="#182B49">AURELIA</text>
    <text x="95" y="72" font-family="Public Sans, sans-serif" font-size="13" font-weight="500" letter-spacing="2.4" fill="#526071">ATELIER D'ARCHITECTURE</text>
  </g>
</svg>`;

const DEMO_SVG_MONOGRAM = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88 88" width="88" height="88">
  <rect x="4" y="4" width="80" height="80" rx="18" fill="#182B49"/>
  <path d="M44 19L65 67H54.5L50.5 56.5H37.5L33.5 67H23L44 19ZM44 33L40 47H48L44 33Z" fill="#FFFFFF"/>
  <circle cx="67" cy="21" r="6" fill="#C97B36"/>
</svg>`;

const DEMO_SVG_MONO_DARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 110" width="360" height="110">
  <g fill="none" fill-rule="evenodd">
    <rect x="8" y="12" width="68" height="68" rx="16" fill="#0F172A"/>
    <path d="M42 24L60 66H51L47.5 57H36.5L33 66H24L42 24ZM42 37L38.5 49H45.5L42 37Z" fill="#FFFFFF"/>
    <circle cx="62" cy="26" r="5" fill="#0F172A" stroke="#FFFFFF" stroke-width="2"/>
    <text x="94" y="48" font-family="Plus Jakarta Sans, sans-serif" font-size="30" font-weight="700" letter-spacing="-0.5" fill="#0F172A">AURELIA</text>
    <text x="95" y="72" font-family="Public Sans, sans-serif" font-size="13" font-weight="500" letter-spacing="2.4" fill="#0F172A">ATELIER D'ARCHITECTURE</text>
  </g>
</svg>`;

const DEMO_SVG_MONO_LIGHT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 110" width="360" height="110">
  <g fill="none" fill-rule="evenodd">
    <rect x="8" y="12" width="68" height="68" rx="16" fill="#FFFFFF"/>
    <path d="M42 24L60 66H51L47.5 57H36.5L33 66H24L42 24ZM42 37L38.5 49H45.5L42 37Z" fill="#182B49"/>
    <circle cx="62" cy="26" r="5" fill="#182B49"/>
    <text x="94" y="48" font-family="Plus Jakarta Sans, sans-serif" font-size="30" font-weight="700" letter-spacing="-0.5" fill="#FFFFFF">AURELIA</text>
    <text x="95" y="72" font-family="Public Sans, sans-serif" font-size="13" font-weight="500" letter-spacing="2.4" fill="#E2E8F0">ATELIER D'ARCHITECTURE</text>
  </g>
</svg>`;

const DEMO_SVG_NO_BASELINE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 92" width="320" height="92">
  <g fill="none" fill-rule="evenodd">
    <rect x="8" y="12" width="68" height="68" rx="16" fill="#182B49"/>
    <path d="M42 24L60 66H51L47.5 57H36.5L33 66H24L42 24ZM42 37L38.5 49H45.5L42 37Z" fill="#FFFFFF"/>
    <circle cx="62" cy="26" r="5" fill="#C97B36"/>
    <text x="94" y="56" font-family="Plus Jakarta Sans, sans-serif" font-size="32" font-weight="700" letter-spacing="-0.5" fill="#182B49">AURELIA</text>
  </g>
</svg>`;

export function createDemoBrandBook(): BrandBookData {
  return {
    name: 'Aurelia Atelier',
    baseline: 'Architecture bioclimatique & espaces durables',
    sector: 'Architecture & Urbanisme Durable',
    description:
      'Aurelia Atelier conçoit des bâtiments publics, habitats collectifs et lieux culturels alliant sobriété carbone, lumière naturelle et pérennité constructive.',
    values: ['Précision constructive', 'Sobriété carbone', 'Clarté spatiale', 'Ancrage local'],
    language: 'fr',
    status: 'generated',
    logos: [
      {
        variantType: 'primary',
        origin: 'uploaded',
        mimeType: 'image/svg+xml',
        width: 360,
        height: 110,
        hasTransparency: true,
        qualityWarnings: [],
        dataUrl: svgToDataUrl(DEMO_SVG_PRIMARY),
      },
      {
        variantType: 'monogram',
        origin: 'generated',
        mimeType: 'image/svg+xml',
        width: 88,
        height: 88,
        hasTransparency: true,
        qualityWarnings: [],
        dataUrl: svgToDataUrl(DEMO_SVG_MONOGRAM),
      },
      {
        variantType: 'mono_dark',
        origin: 'generated',
        mimeType: 'image/svg+xml',
        width: 360,
        height: 110,
        hasTransparency: true,
        qualityWarnings: [],
        dataUrl: svgToDataUrl(DEMO_SVG_MONO_DARK),
      },
      {
        variantType: 'mono_light',
        origin: 'generated',
        mimeType: 'image/svg+xml',
        width: 360,
        height: 110,
        hasTransparency: true,
        qualityWarnings: [],
        dataUrl: svgToDataUrl(DEMO_SVG_MONO_LIGHT),
      },
      {
        variantType: 'no_baseline',
        origin: 'generated',
        mimeType: 'image/svg+xml',
        width: 320,
        height: 92,
        hasTransparency: true,
        qualityWarnings: [],
        dataUrl: svgToDataUrl(DEMO_SVG_NO_BASELINE),
      },
    ],
    colors: [
      { name: 'Bleu Marine Minéral', role: 'primary', hex: '#182B49', sortOrder: 0 },
      { name: 'Ardoise Structurelle', role: 'secondary', hex: '#334E68', sortOrder: 1 },
      { name: 'Cuivre Oxydé', role: 'accent', hex: '#C97B36', sortOrder: 2 },
      { name: 'Papier Calque', role: 'background', hex: '#F9FAFB', sortOrder: 3 },
      { name: 'Pierre Claire', role: 'surface', hex: '#FFFFFF', sortOrder: 4 },
      { name: 'Encre Graphite', role: 'text_primary', hex: '#0F172A', sortOrder: 5 },
      { name: 'Gris Crayon', role: 'text_secondary', hex: '#475569', sortOrder: 6 },
      { name: 'Filet Technique', role: 'border', hex: '#DCE3EC', sortOrder: 7 },
      { name: 'Validation Forêt', role: 'success', hex: '#15803D', sortOrder: 8 },
      { name: 'Alerte Ocre', role: 'warning', hex: '#B45309', sortOrder: 9 },
      { name: 'Erreur Brique', role: 'error', hex: '#B91C1C', sortOrder: 10 },
    ],
    gradients: [
      { id: 'grad-1', name: 'Dégradé Signature Nocturne', angle: 135, fromHex: '#182B49', toHex: '#334E68' },
      { id: 'grad-2', name: 'Dégradé Horizon Cuivre', angle: 120, fromHex: '#182B49', toHex: '#C97B36' },
    ],
    fonts: [
      {
        family: 'Fraunces',
        role: 'heading',
        source: 'google',
        weights: ['400', '600', '700'],
        fallback: 'Georgia, serif',
        coverage: { frenchAccents: true, euroSymbol: true, frenchQuotes: true, tabularDigits: false, glyphCount: 640, isVariable: true, variableAxes: ['wght', 'opsz'] },
        rightsConfirmed: true,
      },
      {
        family: 'Plus Jakarta Sans',
        role: 'body',
        source: 'google',
        weights: ['400', '500', '600', '700'],
        fallback: 'sans-serif',
        coverage: { frenchAccents: true, euroSymbol: true, frenchQuotes: true, tabularDigits: true, glyphCount: 580, isVariable: true, variableAxes: ['wght'] },
        rightsConfirmed: true,
      },
      {
        family: 'JetBrains Mono',
        role: 'mono',
        source: 'google',
        weights: ['400', '500'],
        fallback: 'monospace',
        coverage: { frenchAccents: true, euroSymbol: true, frenchQuotes: true, tabularDigits: true, glyphCount: 720, isVariable: true, variableAxes: ['wght'] },
        rightsConfirmed: true,
      },
    ],
    typeScale: buildTypeScalePreset('balanced'),
    gridConfig: {
      containerMaxPx: 1200,
      columns: 12,
      gutterPx: 24,
      baseSpacingPx: 8,
      radiusSmPx: 4,
      radiusMdPx: 8,
      radiusLgPx: 14,
      shadowStyle: 'subtle',
    },
    iconConfig: {
      style: 'outline',
      strokeWidth: 1.75,
      cornerStyle: 'rounded',
    },
    protectionConfig: {
      unitLabel: 'Hauteur du monogramme (X)',
      marginMultiplier: 0.5,
      minPrintMm: 22,
      minDigitalPx: 110,
      minNoBaselinePx: 72,
    },
    guideline: {
      template: 'classic',
      format: 'landscape',
      enabledSections: ALL_SECTIONS.map((s) => s.id),
      sectionCopy: getDefaultSectionCopy('fr'),
      version: 1,
      status: 'generated',
    },
  };
}

export function createEmptyBrandBook(): BrandBookData {
  return {
    name: 'Nouvelle Marque',
    baseline: '',
    sector: '',
    description: '',
    values: ['Clarté', 'Excellence', 'Durabilité'],
    language: 'fr',
    status: 'draft',
    logos: [],
    colors: [
      { name: 'Primaire', role: 'primary', hex: '#1E293B', sortOrder: 0 },
      { name: 'Secondaire', role: 'secondary', hex: '#475569', sortOrder: 1 },
      { name: 'Accent', role: 'accent', hex: '#0284C7', sortOrder: 2 },
      { name: 'Fond principal', role: 'background', hex: '#FFFFFF', sortOrder: 3 },
      { name: 'Surface', role: 'surface', hex: '#F8FAFC', sortOrder: 4 },
      { name: 'Texte principal', role: 'text_primary', hex: '#0F172A', sortOrder: 5 },
      { name: 'Texte secondaire', role: 'text_secondary', hex: '#475569', sortOrder: 6 },
      { name: 'Bordures', role: 'border', hex: '#E2E8F0', sortOrder: 7 },
      { name: 'Succès', role: 'success', hex: '#16A34A', sortOrder: 8 },
      { name: 'Avertissement', role: 'warning', hex: '#D97706', sortOrder: 9 },
      { name: 'Erreur', role: 'error', hex: '#DC2626', sortOrder: 10 },
    ],
    gradients: [
      { id: 'grad-1', name: 'Dégradé Signature 1', angle: 135, fromHex: '#1E293B', toHex: '#475569' },
      { id: 'grad-2', name: 'Dégradé Signature 2', angle: 120, fromHex: '#475569', toHex: '#0284C7' },
    ],
    fonts: [
      {
        family: 'Plus Jakarta Sans',
        role: 'heading',
        source: 'google',
        weights: ['600', '700'],
        fallback: 'sans-serif',
        coverage: { frenchAccents: true, euroSymbol: true, frenchQuotes: true, tabularDigits: true, glyphCount: 580, isVariable: true, variableAxes: ['wght'] },
        rightsConfirmed: true,
      },
      {
        family: 'Public Sans',
        role: 'body',
        source: 'google',
        weights: ['400', '500', '600'],
        fallback: 'sans-serif',
        coverage: { frenchAccents: true, euroSymbol: true, frenchQuotes: true, tabularDigits: true, glyphCount: 520, isVariable: true, variableAxes: ['wght'] },
        rightsConfirmed: true,
      },
      {
        family: 'JetBrains Mono',
        role: 'mono',
        source: 'google',
        weights: ['400', '500'],
        fallback: 'monospace',
        coverage: { frenchAccents: true, euroSymbol: true, frenchQuotes: true, tabularDigits: true, glyphCount: 720, isVariable: true, variableAxes: ['wght'] },
        rightsConfirmed: true,
      },
    ],
    typeScale: buildTypeScalePreset('balanced'),
    gridConfig: {
      containerMaxPx: 1200,
      columns: 12,
      gutterPx: 24,
      baseSpacingPx: 8,
      radiusSmPx: 4,
      radiusMdPx: 8,
      radiusLgPx: 14,
      shadowStyle: 'subtle',
    },
    iconConfig: {
      style: 'outline',
      strokeWidth: 1.75,
      cornerStyle: 'rounded',
    },
    protectionConfig: {
      unitLabel: 'Hauteur du symbole (X)',
      marginMultiplier: 0.5,
      minPrintMm: 20,
      minDigitalPx: 100,
      minNoBaselinePx: 64,
    },
    guideline: {
      template: 'classic',
      format: 'landscape',
      enabledSections: ALL_SECTIONS.map((s) => s.id),
      sectionCopy: getDefaultSectionCopy('fr'),
      version: 1,
      status: 'draft',
    },
  };
}
