import JSZip from 'jszip';
import type { BrandBookData } from '../shared/types.ts';
import {
  buildBrandJson,
  buildTailwindConfigJs,
  buildTokensCss,
  slugify,
} from '../shared/colorEngine.ts';
import { generateBrandBookPdf } from './pdfGenerator.ts';

function decodeDataUrl(dataUrl: string): Buffer | null {
  const commaIdx = dataUrl.indexOf(',');
  if (commaIdx === -1) return null;
  const header = dataUrl.slice(0, commaIdx);
  const payload = dataUrl.slice(commaIdx + 1);
  if (header.includes(';base64')) {
    return Buffer.from(payload, 'base64');
  }
  return Buffer.from(decodeURIComponent(payload), 'utf8');
}

export async function buildBrandExportZip(
  brand: BrandBookData,
  options: { showWatermark?: boolean; includePdf?: boolean } = {}
): Promise<Buffer> {
  const zip = new JSZip();
  const slug = slugify(brand.name || 'brand');

  zip.file('tokens.css', buildTokensCss(brand));
  zip.file('tailwind.config.js', buildTailwindConfigJs(brand));
  zip.file('brand.json', buildBrandJson(brand));

  const logosFolder = zip.folder('logos');
  if (logosFolder) {
    for (const logo of brand.logos) {
      const buf = decodeDataUrl(logo.dataUrl);
      if (!buf) continue;
      const ext = logo.mimeType === 'image/svg+xml' ? 'svg' : 'png';
      logosFolder.file(`${slug}-${logo.variantType}.${ext}`, buf);
    }
  }

  const fontsFolder = zip.folder('fonts');
  if (fontsFolder) {
    for (const font of brand.fonts) {
      if (font.source === 'upload' && font.woff2DataUrl) {
        const buf = decodeDataUrl(font.woff2DataUrl);
        if (buf) {
          fontsFolder.file(`${slugify(font.family)}.woff2`, buf);
        }
      }
    }
  }

  if (options.includePdf !== false) {
    const pdfBuf = await generateBrandBookPdf(brand, {
      showWatermark: options.showWatermark ?? false,
    });
    zip.file(`charte-graphique-${slug}.pdf`, pdfBuf);
  }

  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}
