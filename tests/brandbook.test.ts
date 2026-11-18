import assert from 'node:assert/strict';
import test from 'node:test';
import {
  evaluateWcag,
  getContrastRatio,
  getContrastText,
  suggestAccessibleForeground,
} from '../src/shared/colorEngine.ts';
import { processUploadedLogo, sanitizeSvg } from '../src/server/logoProcessor.ts';
import { generateBrandBookPdf } from '../src/server/pdfGenerator.ts';
import { createDemoBrandBook } from '../src/shared/brandbook/sections.ts';
import {
  createSessionToken,
  hashPassword,
  verifyPassword,
  verifySessionToken,
} from '../src/server/emailAuthService.ts';

test('WCAG contrast calculation and accessible foreground suggestion', () => {
  const bw = getContrastRatio('#000000', '#FFFFFF');
  assert.equal(bw, 21);

  const evalBlackWhite = evaluateWcag('#000000', '#FFFFFF');
  assert.equal(evalBlackWhite.aaNormal, true);
  assert.equal(evalBlackWhite.aaaNormal, true);
  assert.equal(evalBlackWhite.levelLabel, 'AAA');

  const lowContrast = evaluateWcag('#94A3B8', '#FFFFFF');
  assert.equal(lowContrast.aaNormal, false);

  const fixed = suggestAccessibleForeground('#94A3B8', '#FFFFFF', 4.5);
  assert.ok(getContrastRatio(fixed, '#FFFFFF') >= 4.5);

  assert.equal(getContrastText('#182B49'), '#FFFFFF');
  assert.equal(getContrastText('#F8FAFC'), '#0F172A');
});

test('SVG sanitization and automatic logo variant generation', async () => {
  const maliciousSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 80">
    <script>alert('xss')</script>
    <rect x="0" y="0" width="60" height="60" fill="#1D4ED8" onclick="evil()"/>
    <text x="72" y="38" fill="#0F172A">BRAND</text>
    <text x="72" y="58" fill="#64748B">TAGLINE</text>
  </svg>`;

  const cleaned = sanitizeSvg(maliciousSvg);
  assert.equal(cleaned.includes('<script'), false);
  assert.equal(cleaned.includes('onclick'), false);

  const result = await processUploadedLogo(
    Buffer.from(maliciousSvg, 'utf8'),
    'logo.svg',
    'primary'
  );

  assert.equal(result.primary.mimeType, 'image/svg+xml');
  assert.equal(result.primary.width, 200);
  assert.equal(result.primary.height, 80);
  assert.ok(result.generatedVariants.some((v) => v.variantType === 'mono_dark'));
  assert.ok(result.generatedVariants.some((v) => v.variantType === 'mono_light'));
  assert.ok(result.generatedVariants.some((v) => v.variantType === 'no_baseline'));
  assert.ok(result.suggestedPalette.includes('#1D4ED8'));
});

test('Playwright PDF generation with custom embedded font declaration', async () => {
  const demo = createDemoBrandBook();
  demo.fonts = [
    {
      family: 'CustomAtelierTest',
      role: 'heading',
      source: 'upload',
      weights: ['700'],
      fallback: 'sans-serif',
      woff2DataUrl: 'data:font/woff2;base64,d09GMgABAAAAAA==',
      originalFormat: 'woff2',
      coverage: {
        frenchAccents: true,
        euroSymbol: true,
        frenchQuotes: true,
        tabularDigits: true,
        glyphCount: 500,
        isVariable: false,
        variableAxes: [],
      },
      rightsConfirmed: true,
    },
    ...demo.fonts.filter((f) => f.role !== 'heading'),
  ];

  const pdfBuffer = await generateBrandBookPdf(demo, { showWatermark: false });
  assert.ok(pdfBuffer.length > 10000);
  assert.equal(pdfBuffer.subarray(0, 5).toString('ascii'), '%PDF-');
});

test('Email password hashing and signed session token verification', () => {
  const hash = hashPassword('MonMotDePasse2026!');
  assert.ok(hash.startsWith('scrypt$'));
  assert.equal(verifyPassword('MonMotDePasse2026!', hash), true);
  assert.equal(verifyPassword('MauvaisMotDePasse', hash), false);

  const token = createSessionToken({
    uid: 'email_test-123',
    email: 'client@exemple.fr',
    name: 'Client Test',
  });
  assert.ok(token.startsWith('cf.'));

  const decoded = verifySessionToken(token);
  assert.ok(decoded);
  assert.equal(decoded?.uid, 'email_test-123');
  assert.equal(decoded?.email, 'client@exemple.fr');

  const tampered = `${token.slice(0, -4)}zzzz`;
  assert.equal(verifySessionToken(tampered), null);
});
