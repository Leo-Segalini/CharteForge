import opentype from 'opentype.js';
import wawoff2 from 'wawoff2';
import type { FontAssetData, FontCoverage, FontRole } from '../shared/types.ts';

const MAX_FONT_BYTES = 10 * 1024 * 1024;

export function detectFontFormat(
  buffer: Buffer,
  filename: string
): 'ttf' | 'otf' | 'woff' | 'woff2' | null {
  if (buffer.length < 12 || buffer.length > MAX_FONT_BYTES) return null;
  const tag = buffer.subarray(0, 4).toString('ascii');
  if (tag === 'wOF2') return 'woff2';
  if (tag === 'wOFF') return 'woff';
  if (tag === 'OTTO') return 'otf';
  if (
    buffer[0] === 0x00 &&
    buffer[1] === 0x01 &&
    buffer[2] === 0x00 &&
    buffer[3] === 0x00
  ) {
    return 'ttf';
  }
  const lower = filename.toLowerCase();
  if (lower.endsWith('.ttf')) return 'ttf';
  if (lower.endsWith('.otf')) return 'otf';
  if (lower.endsWith('.woff')) return 'woff';
  if (lower.endsWith('.woff2')) return 'woff2';
  return null;
}

function hasGlyph(font: opentype.Font, char: string): boolean {
  const glyph = font.charToGlyph(char);
  return Boolean(glyph && glyph.index !== 0);
}

function detectCoverage(font: opentype.Font): FontCoverage {
  const frenchChars = ['é', 'è', 'ê', 'à', 'ù', 'ç', 'É', 'À'];
  const frenchAccents = frenchChars.every((c) => hasGlyph(font, c));
  const euroSymbol = hasGlyph(font, '€');
  const frenchQuotes = hasGlyph(font, '«') && hasGlyph(font, '»');
  const tabularDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].every((d) =>
    hasGlyph(font, d)
  );

  const fvar = (font.tables as Record<string, unknown>)?.fvar as
    | { axes?: Array<{ tag?: string }> }
    | undefined;
  const variableAxes =
    fvar?.axes?.map((a) => a.tag || '').filter(Boolean) ?? [];

  return {
    frenchAccents,
    euroSymbol,
    frenchQuotes,
    tabularDigits,
    glyphCount: font.numGlyphs || 0,
    isVariable: variableAxes.length > 0,
    variableAxes,
  };
}

export async function processUploadedFont(
  buffer: Buffer,
  originalName: string,
  role: FontRole = 'heading'
): Promise<FontAssetData> {
  const format = detectFontFormat(buffer, originalName);
  if (!format) {
    throw new Error(
      'Format de police non supporté (TTF, OTF, WOFF ou WOFF2 uniquement, max 10 Mo).'
    );
  }

  let family = originalName.replace(/\.(ttf|otf|woff2?)$/i, '').replace(/[-_]+/g, ' ');
  let weights = ['400', '700'];
  let coverage: FontCoverage = {
    frenchAccents: true,
    euroSymbol: true,
    frenchQuotes: true,
    tabularDigits: true,
    glyphCount: 256,
    isVariable: false,
    variableAxes: [],
  };

  if (format === 'ttf' || format === 'otf' || format === 'woff') {
    try {
      const arrayBuf = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength
      );
      const parsed = opentype.parse(arrayBuf);
      const names = parsed.names as unknown as Record<string, Record<string, string>>;
      const detectedFamily =
        names?.preferredFamily?.en ||
        names?.fontFamily?.en ||
        Object.values(names?.fontFamily ?? {})[0];
      if (detectedFamily) {
        family = detectedFamily;
      }

      const os2Weight = (parsed.tables as Record<string, Record<string, number>>)?.os2?.usWeightClass;
      if (os2Weight) {
        weights = [String(os2Weight)];
      }
      coverage = detectCoverage(parsed);
      if (coverage.isVariable) {
        weights = ['400', '500', '600', '700'];
      }
    } catch (err) {
      console.warn('opentype.js partial parse warning:', err);
    }
  }

  let woff2Buffer: Buffer;
  if (format === 'woff2') {
    woff2Buffer = buffer;
  } else {
    try {
      const compressed = await wawoff2.compress(buffer);
      woff2Buffer = Buffer.from(compressed);
    } catch {
      // Fallback to original format if WOFF2 compression rejects non-SFNT input
      woff2Buffer = buffer;
    }
  }

  const mime = format === 'woff2' || woff2Buffer !== buffer ? 'font/woff2' : `font/${format}`;
  const woff2DataUrl = `data:${mime};base64,${woff2Buffer.toString('base64')}`;

  return {
    family,
    role,
    source: 'upload',
    weights,
    fallback: role === 'mono' ? 'monospace' : 'sans-serif',
    woff2DataUrl,
    originalFormat: format,
    coverage,
    rightsConfirmed: false,
  };
}
