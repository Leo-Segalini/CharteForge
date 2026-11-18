import sharp from 'sharp';
import { optimize } from 'svgo';
import type { LogoAssetData } from '../shared/types.ts';
import { rgbToHex } from '../shared/colorEngine.ts';

const MAX_FILE_BYTES = 10 * 1024 * 1024;

export interface ProcessedLogoResult {
  primary: LogoAssetData;
  generatedVariants: LogoAssetData[];
  suggestedPalette: string[];
}

export function detectImageMime(buffer: Buffer, originalName: string): string | null {
  if (buffer.length === 0 || buffer.length > MAX_FILE_BYTES) {
    return null;
  }
  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return 'image/png';
  }
  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }
  // WebP: RIFF....WEBP
  if (
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'image/webp';
  }
  // SVG
  const head = buffer.subarray(0, 1024).toString('utf8').trim().toLowerCase();
  if (
    (head.includes('<svg') || head.startsWith('<?xml')) &&
    originalName.toLowerCase().endsWith('.svg')
  ) {
    return 'image/svg+xml';
  }
  if (head.includes('<svg')) {
    return 'image/svg+xml';
  }
  return null;
}

export function sanitizeSvg(rawSvg: string): string {
  // Strip dangerous scripts, foreignObject, event handlers, and external references
  let cleaned = rawSvg
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, '')
    .replace(/\son[a-z]+\s*=\s*(['"])[\s\S]*?\1/gi, '')
    .replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, '')
    .replace(/(href|xlink:href)\s*=\s*(['"])\s*(javascript:|https?:|\/\/)[\s\S]*?\2/gi, '');

  const result = optimize(cleaned, {
    multipass: true,
    plugins: [
      'preset-default',
      'removeScripts',
    ],
  });

  return result.data;
}

function parseSvgDimensions(svg: string): { width: number; height: number } {
  const vbMatch = svg.match(/viewBox\s*=\s*['"]\s*([0-9.-]+)[,\s]+([0-9.-]+)[,\s]+([0-9.]+)[,\s]+([0-9.]+)\s*['"]/i);
  if (vbMatch) {
    return {
      width: Math.round(parseFloat(vbMatch[3])) || 300,
      height: Math.round(parseFloat(vbMatch[4])) || 120,
    };
  }
  const wMatch = svg.match(/\bwidth\s*=\s*['"]([0-9.]+)/i);
  const hMatch = svg.match(/\bheight\s*=\s*['"]([0-9.]+)/i);
  return {
    width: wMatch ? Math.round(parseFloat(wMatch[1])) : 300,
    height: hMatch ? Math.round(parseFloat(hMatch[1])) : 120,
  };
}

function recolorSvg(svg: string, targetHex: string): string {
  return svg
    .replace(/\bfill="(?!none|transparent|url\()([^"]+)"/gi, `fill="${targetHex}"`)
    .replace(/\bfill='(?!none|transparent|url\()([^']+)'/gi, `fill='${targetHex}'`)
    .replace(/\bstroke="(?!none|transparent|url\()([^"]+)"/gi, `stroke="${targetHex}"`)
    .replace(/\bstroke='(?!none|transparent|url\()([^']+)'/gi, `stroke='${targetHex}'`);
}

function stripSvgBaseline(svg: string): string {
  // Remove secondary text elements if more than 1 text tag exists
  const textMatches = svg.match(/<text[\s\S]*?<\/text>/gi);
  if (textMatches && textMatches.length > 1) {
    const lastText = textMatches[textMatches.length - 1];
    return svg.replace(lastText, '');
  }
  return svg;
}

function extractSvgColors(svg: string): string[] {
  const matches = svg.match(/#[0-9A-Fa-f]{6}\b|#[0-9A-Fa-f]{3}\b/g) ?? [];
  const counts = new Map<string, number>();
  for (const m of matches) {
    let hex = m.toUpperCase();
    if (hex.length === 4) {
      hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }
    if (hex === '#FFFFFF' || hex === '#000000') continue;
    counts.set(hex, (counts.get(hex) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([hex]) => hex);
}

function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

async function extractRasterDominantColors(buffer: Buffer): Promise<string[]> {
  const { data } = await sharp(buffer)
    .resize(64, 64, { fit: 'inside' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const buckets = new Map<string, { r: number; g: number; b: number; count: number }>();

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a < 120) continue;
    // Skip near-pure white background pixels
    if (r > 242 && g > 242 && b > 242) continue;

    const qr = Math.round(r / 24) * 24;
    const qg = Math.round(g / 24) * 24;
    const qb = Math.round(b / 24) * 24;
    const key = `${qr}-${qg}-${qb}`;
    const existing = buckets.get(key);
    if (existing) {
      existing.r += r;
      existing.g += g;
      existing.b += b;
      existing.count += 1;
    } else {
      buckets.set(key, { r, g, b, count: 1 });
    }
  }

  return Array.from(buckets.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((b) =>
      rgbToHex({
        r: b.r / b.count,
        g: b.g / b.count,
        b: b.b / b.count,
      })
    );
}

async function createRasterAlphaBuffer(buffer: Buffer, hasAlpha: boolean): Promise<Buffer> {
  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const out = Buffer.from(data);
  if (!hasAlpha) {
    // Convert near-white background to transparent
    for (let i = 0; i < out.length; i += 4) {
      const r = out[i];
      const g = out[i + 1];
      const b = out[i + 2];
      if (r > 238 && g > 238 && b > 238) {
        out[i + 3] = 0;
      }
    }
  }
  return sharp(out, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();
}

async function createRasterMonochrome(
  alphaPngBuffer: Buffer,
  targetRgb: { r: number; g: number; b: number }
): Promise<string> {
  const { data, info } = await sharp(alphaPngBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const out = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i += 4) {
    out[i] = targetRgb.r;
    out[i + 1] = targetRgb.g;
    out[i + 2] = targetRgb.b;
    out[i + 3] = data[i + 3];
  }

  const png = await sharp(out, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();

  return `data:image/png;base64,${png.toString('base64')}`;
}

export async function processUploadedLogo(
  buffer: Buffer,
  originalName: string,
  variantType: LogoAssetData['variantType'] = 'primary'
): Promise<ProcessedLogoResult> {
  const mime = detectImageMime(buffer, originalName);
  if (!mime) {
    throw new Error('Format de fichier non autorisé ou taille supérieure à 10 Mo.');
  }

  if (mime === 'image/svg+xml') {
    const cleanSvg = sanitizeSvg(buffer.toString('utf8'));
    const { width, height } = parseSvgDimensions(cleanSvg);
    const warnings: string[] = [];
    if (width < 40 || height < 20) {
      warnings.push('Dimensions SVG très réduites : vérifiez le viewBox.');
    }

    const primary: LogoAssetData = {
      variantType,
      origin: 'uploaded',
      mimeType: 'image/svg+xml',
      width,
      height,
      hasTransparency: true,
      qualityWarnings: warnings,
      dataUrl: svgToDataUrl(cleanSvg),
    };

    const generatedVariants: LogoAssetData[] = [];
    if (variantType === 'primary') {
      const darkSvg = recolorSvg(cleanSvg, '#0F172A');
      const lightSvg = recolorSvg(cleanSvg, '#FFFFFF');
      const noBaseSvg = stripSvgBaseline(cleanSvg);

      generatedVariants.push(
        {
          variantType: 'mono_dark',
          origin: 'generated',
          mimeType: 'image/svg+xml',
          width,
          height,
          hasTransparency: true,
          qualityWarnings: [],
          dataUrl: svgToDataUrl(darkSvg),
        },
        {
          variantType: 'mono_light',
          origin: 'generated',
          mimeType: 'image/svg+xml',
          width,
          height,
          hasTransparency: true,
          qualityWarnings: [],
          dataUrl: svgToDataUrl(lightSvg),
        }
      );

      if (noBaseSvg !== cleanSvg) {
        generatedVariants.push({
          variantType: 'no_baseline',
          origin: 'generated',
          mimeType: 'image/svg+xml',
          width,
          height,
          hasTransparency: true,
          qualityWarnings: [],
          dataUrl: svgToDataUrl(noBaseSvg),
        });
      }
    }

    return {
      primary,
      generatedVariants,
      suggestedPalette: extractSvgColors(cleanSvg),
    };
  }

  // Raster path (PNG / JPEG / WebP)
  const meta = await sharp(buffer).metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  const hasTransparency = Boolean(meta.hasAlpha);
  const warnings: string[] = [];

  if (width < 300 || height < 120) {
    warnings.push(
      `Résolution faible (${width}×${height}px). Recommandé : ≥ 600px de large ou format SVG.`
    );
  }
  if (!hasTransparency) {
    warnings.push(
      'Aucune couche alpha détectée (fond opaque). Un détourage automatique du fond clair a été appliqué.'
    );
  }

  const normalizedPng = await sharp(buffer).png().toBuffer();
  const primary: LogoAssetData = {
    variantType,
    origin: 'uploaded',
    mimeType: 'image/png',
    width,
    height,
    hasTransparency,
    qualityWarnings: warnings,
    dataUrl: `data:image/png;base64,${normalizedPng.toString('base64')}`,
  };

  const generatedVariants: LogoAssetData[] = [];
  if (variantType === 'primary') {
    const alphaBuffer = await createRasterAlphaBuffer(buffer, hasTransparency);
    const monoDarkUrl = await createRasterMonochrome(alphaBuffer, { r: 15, g: 23, b: 42 });
    const monoLightUrl = await createRasterMonochrome(alphaBuffer, { r: 255, g: 255, b: 255 });

    generatedVariants.push(
      {
        variantType: 'mono_dark',
        origin: 'generated',
        mimeType: 'image/png',
        width,
        height,
        hasTransparency: true,
        qualityWarnings: [],
        dataUrl: monoDarkUrl,
      },
      {
        variantType: 'mono_light',
        origin: 'generated',
        mimeType: 'image/png',
        width,
        height,
        hasTransparency: true,
        qualityWarnings: [],
        dataUrl: monoLightUrl,
      }
    );
  }

  const suggestedPalette = await extractRasterDominantColors(buffer);

  return {
    primary,
    generatedVariants,
    suggestedPalette,
  };
}

export async function cropLogoToMonogram(
  dataUrl: string,
  cropPct: { x: number; y: number; width: number; height: number }
): Promise<LogoAssetData> {
  if (dataUrl.startsWith('data:image/svg+xml')) {
    const raw = decodeURIComponent(dataUrl.split(',')[1] ?? '');
    const { width, height } = parseSvgDimensions(raw);
    const vx = Math.max(0, (cropPct.x / 100) * width);
    const vy = Math.max(0, (cropPct.y / 100) * height);
    const vw = Math.max(10, (cropPct.width / 100) * width);
    const vh = Math.max(10, (cropPct.height / 100) * height);

    const croppedSvg = raw
      .replace(/viewBox\s*=\s*(['"])[^'"]*\1/i, `viewBox="${vx.toFixed(1)} ${vy.toFixed(1)} ${vw.toFixed(1)} ${vh.toFixed(1)}"`)
      .replace(/\bwidth\s*=\s*(['"])[^'"]*\1/i, `width="${Math.round(vw)}"`)
      .replace(/\bheight\s*=\s*(['"])[^'"]*\1/i, `height="${Math.round(vh)}"`);

    return {
      variantType: 'monogram',
      origin: 'generated',
      mimeType: 'image/svg+xml',
      width: Math.round(vw),
      height: Math.round(vh),
      hasTransparency: true,
      qualityWarnings: [],
      dataUrl: svgToDataUrl(croppedSvg),
    };
  }

  const base64 = dataUrl.split(',')[1];
  if (!base64) {
    throw new Error('Image source invalide.');
  }
  const inputBuffer = Buffer.from(base64, 'base64');
  const meta = await sharp(inputBuffer).metadata();
  const imgW = meta.width ?? 100;
  const imgH = meta.height ?? 100;

  const left = Math.max(0, Math.min(imgW - 1, Math.round((cropPct.x / 100) * imgW)));
  const top = Math.max(0, Math.min(imgH - 1, Math.round((cropPct.y / 100) * imgH)));
  const width = Math.max(8, Math.min(imgW - left, Math.round((cropPct.width / 100) * imgW)));
  const height = Math.max(8, Math.min(imgH - top, Math.round((cropPct.height / 100) * imgH)));

  const cropped = await sharp(inputBuffer)
    .extract({ left, top, width, height })
    .png()
    .toBuffer();

  return {
    variantType: 'monogram',
    origin: 'generated',
    mimeType: 'image/png',
    width,
    height,
    hasTransparency: Boolean(meta.hasAlpha),
    qualityWarnings: [],
    dataUrl: `data:image/png;base64,${cropped.toString('base64')}`,
  };
}
