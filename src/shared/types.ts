export type DocumentLanguage = 'fr' | 'en';
export type DocumentFormat = 'landscape' | 'portrait';
export type LayoutTemplate = 'classic' | 'editorial' | 'minimal';

export type LogoVariantType =
  | 'primary'
  | 'horizontal'
  | 'vertical'
  | 'monogram'
  | 'negative'
  | 'mono_dark'
  | 'mono_light'
  | 'no_baseline';

export type ColorRole =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'background'
  | 'surface'
  | 'text_primary'
  | 'text_secondary'
  | 'border'
  | 'success'
  | 'warning'
  | 'error'
  | 'custom';

export type FontRole = 'heading' | 'body' | 'mono';

export type SectionId =
  | 'cover'
  | 'toc'
  | 'identity'
  | 'logotype'
  | 'clearspace'
  | 'misuse'
  | 'palette'
  | 'balance'
  | 'accessibility'
  | 'matrix'
  | 'typography'
  | 'typescale'
  | 'grid'
  | 'iconography'
  | 'components'
  | 'documents'
  | 'tokens'
  | 'checklist';

export interface LogoAssetData {
  id?: string | number;
  variantType: LogoVariantType;
  origin: 'uploaded' | 'generated';
  mimeType: string;
  width: number;
  height: number;
  hasTransparency: boolean;
  qualityWarnings: string[];
  dataUrl: string;
}

export interface ColorTokenData {
  id?: string | number;
  name: string;
  role: ColorRole | string;
  hex: string;
  sortOrder: number;
}

export interface GradientSpec {
  id: string;
  name: string;
  angle: number;
  fromHex: string;
  toHex: string;
  viaHex?: string;
}

export interface FontCoverage {
  frenchAccents: boolean;
  euroSymbol: boolean;
  frenchQuotes: boolean;
  tabularDigits: boolean;
  glyphCount: number;
  isVariable: boolean;
  variableAxes: string[];
}

export interface FontAssetData {
  id?: string | number;
  family: string;
  role: FontRole;
  source: 'upload' | 'google';
  weights: string[];
  fallback: string;
  woff2DataUrl?: string | null;
  originalFormat?: string | null;
  coverage: FontCoverage;
  rightsConfirmed: boolean;
}

export interface TypeScaleLevel {
  key: 'h1' | 'h2' | 'h3' | 'body' | 'label' | 'caption';
  label: string;
  sizePx: number;
  lineHeight: number;
  weight: string;
  letterSpacingEm: number;
  role: FontRole;
}

export type TypeScalePreset = 'compact' | 'balanced' | 'airy';

export interface TypeScaleConfig {
  preset: TypeScalePreset;
  levels: TypeScaleLevel[];
}

export interface GridConfig {
  containerMaxPx: number;
  columns: number;
  gutterPx: number;
  baseSpacingPx: number;
  radiusSmPx: number;
  radiusMdPx: number;
  radiusLgPx: number;
  shadowStyle: 'none' | 'subtle' | 'elevated';
}

export interface IconConfig {
  style: 'outline' | 'duotone' | 'solid';
  strokeWidth: number;
  cornerStyle: 'rounded' | 'sharp';
}

export interface ProtectionConfig {
  unitLabel: string;
  marginMultiplier: number;
  minPrintMm: number;
  minDigitalPx: number;
  minNoBaselinePx: number;
}

export interface GuidelineConfig {
  id?: number;
  template: LayoutTemplate;
  format: DocumentFormat;
  enabledSections: SectionId[];
  sectionCopy: Record<string, string>;
  version: number;
  status: 'draft' | 'generated';
  shareToken?: string | null;
  shareExpiresAt?: string | null;
}

export interface BrandBookData {
  id?: number;
  name: string;
  baseline: string;
  sector: string;
  description: string;
  values: string[];
  language: DocumentLanguage;
  status: 'draft' | 'generated';
  logos: LogoAssetData[];
  colors: ColorTokenData[];
  gradients: GradientSpec[];
  fonts: FontAssetData[];
  typeScale: TypeScaleConfig;
  gridConfig: GridConfig;
  iconConfig: IconConfig;
  protectionConfig: ProtectionConfig;
  guideline: GuidelineConfig;
  updatedAt?: string;
}

export interface UserProfile {
  id: number;
  uid: string;
  email: string;
  displayName: string | null;
  role: 'user' | 'admin';
  plan: 'free' | 'pro';
}
