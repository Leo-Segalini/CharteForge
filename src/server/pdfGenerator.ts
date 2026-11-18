import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright-core';
import type { BrandBookData } from '../shared/types.ts';
import { renderBrandBookDocument } from '../shared/brandbook/renderer.ts';

function resolveChromiumPath(): string | undefined {
  const roots = ['/ms-playwright', '/root/.cache/ms-playwright'];
  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    const entries = fs.readdirSync(root);
    for (const entry of entries) {
      if (entry.startsWith('chromium_headless_shell')) {
        const candidate = path.join(
          root,
          entry,
          'chrome-headless-shell-linux64',
          'chrome-headless-shell'
        );
        if (fs.existsSync(candidate)) {
          return candidate;
        }
      }
      if (entry.startsWith('chromium-')) {
        const candidate = path.join(root, entry, 'chrome-linux', 'chrome');
        if (fs.existsSync(candidate)) {
          return candidate;
        }
      }
    }
  }
  return undefined;
}

class PdfGenerationQueue {
  private active = 0;
  private maxConcurrent = 2;
  private queue: Array<() => void> = [];

  async run<T>(task: () => Promise<T>): Promise<T> {
    if (this.active >= this.maxConcurrent) {
      await new Promise<void>((resolve) => this.queue.push(resolve));
    }
    this.active++;
    try {
      return await task();
    } finally {
      this.active--;
      const next = this.queue.shift();
      if (next) next();
    }
  }
}

const pdfQueue = new PdfGenerationQueue();

export async function generateBrandBookPdf(
  brand: BrandBookData,
  options: { showWatermark?: boolean } = {}
): Promise<Buffer> {
  return pdfQueue.run(async () => {
    const html = renderBrandBookDocument(brand, {
      showWatermark: options.showWatermark ?? false,
    });

    const executablePath = resolveChromiumPath();
    const browser = await chromium.launch({
      ...(executablePath ? { executablePath } : {}),
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--font-render-hinting=none',
      ],
    });

    try {
      const context = await browser.newContext();
      const page = await context.newPage();

      await page.setContent(html, {
        waitUntil: 'networkidle',
        timeout: 25000,
      });

      await page.evaluate(async () => {
        await document.fonts.ready;
      });

      const isLandscape = brand.guideline.format !== 'portrait';

      const pdfBytes = await page.pdf({
        format: 'A4',
        landscape: isLandscape,
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
      });

      return Buffer.from(pdfBytes);
    } finally {
      await browser.close();
    }
  });
}
