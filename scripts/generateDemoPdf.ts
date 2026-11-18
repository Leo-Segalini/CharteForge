import fs from 'fs';
import path from 'path';
import { createDemoBrandBook } from '../src/shared/brandbook/sections.ts';
import { generateBrandBookPdf } from '../src/server/pdfGenerator.ts';

async function main() {
  const demo = createDemoBrandBook();
  const pdf = await generateBrandBookPdf(demo, { showWatermark: false });
  const publicDir = path.resolve(process.cwd(), 'public');
  fs.mkdirSync(publicDir, { recursive: true });
  const outPath = path.join(publicDir, 'demo-charte-aurelia.pdf');
  fs.writeFileSync(outPath, pdf);
  console.log(`Generated ${outPath} (${pdf.length} bytes)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
