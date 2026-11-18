import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import express, { type Request } from 'express';
import cors from 'dotenv/config';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import {
  findUserByEmail,
  findUserByVerificationToken,
  getOrCreateUser,
  markUserEmailVerified,
  toPublicUserProfile,
  updateUserVerificationToken,
  upsertEmailUserPendingVerification,
} from './src/db/users.ts';
import { optionalAuth, requireAuth, type AuthRequest } from './src/middleware/auth.ts';
import {
  createSessionToken,
  generateVerificationToken,
  hashPassword,
  sendBrevoVerificationEmail,
  verifyPassword,
} from './src/server/emailAuthService.ts';
import {
  countUserBrands,
  createShareToken,
  deleteBrandBook,
  duplicateBrandBook,
  getAdminStats,
  getBrandById,
  getBrandByShareToken,
  listUserBrands,
  saveAdminConfig,
  saveBrandBook,
  setUserPlan,
} from './src/server/brandRepository.ts';
import { cropLogoToMonogram, processUploadedLogo } from './src/server/logoProcessor.ts';
import { processUploadedFont } from './src/server/fontProcessor.ts';
import { generateBrandBookPdf } from './src/server/pdfGenerator.ts';
import { buildBrandExportZip } from './src/server/zipExporter.ts';
import { generateSectionIntroCopy } from './src/server/aiService.ts';
import { createDemoBrandBook } from './src/shared/brandbook/sections.ts';
import { slugify } from './src/shared/colorEngine.ts';
import {
  buildLlmsFullTxt,
  buildLlmsTxt,
  buildStructuredDataGraph,
  OG_IMAGE_PATH,
  resolveRouteKeyFromPath,
  ROUTE_SEO_META,
} from './src/shared/seoConfig.ts';
import type { BrandBookData, FontRole, LogoVariantType, SectionId } from './src/shared/types.ts';

void cors;

const app = express();
app.set('trust proxy', 1);
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop d’imports en peu de temps. Réessayez dans une minute.' },
});

const exportLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Limite de génération atteinte. Réessayez dans un instant.' },
});

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de tentatives. Réessayez dans une minute.' },
});

function resolveAppOrigin(req: Request): string {
  const originHeader = req.get('origin');
  if (originHeader && originHeader.startsWith('http')) {
    return originHeader.replace(/\/$/, '');
  }
  const host = req.get('x-forwarded-host') || req.get('host');
  const proto = req.get('x-forwarded-proto') || req.protocol || 'https';
  if (host) {
    return `${proto}://${host}`.replace(/\/$/, '');
  }
  return (process.env.APP_URL || `http://localhost:${PORT}`).replace(/\/$/, '');
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.get('/api/demo-brand', (_req, res) => {
  res.json(createDemoBrandBook());
});

// SEO & GEO Endpoints (robots.txt, sitemap.xml, llms.txt, llms-full.txt)
app.get('/robots.txt', (req, res) => {
  const origin = resolveAppOrigin(req);
  res.type('text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(
    [
      'User-agent: *',
      'Allow: /',
      'Allow: /tarifs',
      'Allow: /llms.txt',
      'Allow: /llms-full.txt',
      'Allow: /demo-charte-aurelia.pdf',
      'Allow: /og-charteforge.png',
      'Disallow: /api/',
      'Disallow: /studio',
      'Disallow: /dashboard',
      'Disallow: /admin',
      'Disallow: /connexion',
      '',
      '# AI Search & Generative Engine Crawlers (GEO)',
      'User-agent: OAI-SearchBot',
      'Allow: /',
      'Allow: /tarifs',
      'Allow: /llms.txt',
      'Allow: /llms-full.txt',
      'Disallow: /api/',
      '',
      'User-agent: GPTBot',
      'Allow: /',
      'Allow: /tarifs',
      'Allow: /llms.txt',
      'Allow: /llms-full.txt',
      'Disallow: /api/',
      '',
      'User-agent: ChatGPT-User',
      'Allow: /',
      'Allow: /tarifs',
      'Allow: /llms.txt',
      'Allow: /llms-full.txt',
      'Disallow: /api/',
      '',
      'User-agent: ClaudeBot',
      'Allow: /',
      'Allow: /tarifs',
      'Allow: /llms.txt',
      'Allow: /llms-full.txt',
      'Disallow: /api/',
      '',
      'User-agent: PerplexityBot',
      'Allow: /',
      'Allow: /tarifs',
      'Allow: /llms.txt',
      'Allow: /llms-full.txt',
      'Disallow: /api/',
      '',
      'User-agent: Google-Extended',
      'Allow: /',
      'Allow: /tarifs',
      'Allow: /llms.txt',
      'Allow: /llms-full.txt',
      'Disallow: /api/',
      '',
      `Sitemap: ${origin}/sitemap.xml`,
    ].join('\n')
  );
});

app.get('/sitemap.xml', (req, res) => {
  const origin = resolveAppOrigin(req);
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: `${origin}/`, changefreq: 'weekly', priority: '1.0' },
    { loc: `${origin}/tarifs`, changefreq: 'weekly', priority: '0.9' },
    { loc: `${origin}/demo-charte-aurelia.pdf`, changefreq: 'monthly', priority: '0.7' },
    { loc: `${origin}/llms.txt`, changefreq: 'weekly', priority: '0.6' },
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;
  res.type('application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(xml);
});

app.get('/llms.txt', (req, res) => {
  const origin = resolveAppOrigin(req);
  res.type('text/markdown; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(buildLlmsTxt(origin));
});

app.get('/llms-full.txt', (req, res) => {
  const origin = resolveAppOrigin(req);
  res.type('text/markdown; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(buildLlmsFullTxt(origin));
});

// Auth sync (Google / Firebase)
app.post('/api/auth/sync', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user!.uid;
    const email = req.user!.email || `${uid}@user.local`;
    const name = (req.user!.name as string | undefined) ?? null;
    const user = await getOrCreateUser(
      uid,
      email,
      name,
      req.user!.authProvider === 'email' ? 'email' : 'google'
    );
    res.json({ user: toPublicUserProfile(user) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur de synchronisation';
    res.status(500).json({ error: message });
  }
});

app.get('/api/auth/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await getOrCreateUser(
      req.user!.uid,
      req.user!.email || '',
      req.user!.name ?? null,
      req.user!.authProvider === 'email' ? 'email' : 'google'
    );
    res.json({ user: toPublicUserProfile(user) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    res.status(500).json({ error: message });
  }
});

// Email & Password Registration with Brevo verification
app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const rawEmail = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    const displayName =
      typeof req.body.displayName === 'string' && req.body.displayName.trim().length > 0
        ? req.body.displayName.trim().slice(0, 80)
        : null;

    if (!EMAIL_REGEX.test(rawEmail)) {
      return res.status(400).json({ error: 'Adresse e-mail invalide.' });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: 'Le mot de passe doit contenir au moins 8 caractères.' });
    }

    const existing = await findUserByEmail(rawEmail);
    if (existing) {
      if (existing.authProvider === 'google' && !existing.passwordHash) {
        return res.status(409).json({
          error:
            'Un compte Google existe déjà pour cet e-mail. Utilisez le bouton « Continuer avec Google ».',
        });
      }
      if (existing.emailVerified) {
        return res.status(409).json({
          error: 'Un compte vérifié existe déjà avec cet e-mail. Connectez-vous.',
        });
      }
    }

    const passwordHash = hashPassword(password);
    const verificationToken = generateVerificationToken();
    const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const appOrigin = resolveAppOrigin(req);
    const verifyUrl = `${appOrigin}/?verify_email=${encodeURIComponent(verificationToken)}`;

    // Send verification email via Brevo before confirming registration
    await sendBrevoVerificationEmail({
      toEmail: rawEmail,
      toName: displayName,
      verifyUrl,
    });

    await upsertEmailUserPendingVerification({
      uid: existing?.uid ?? `email_${crypto.randomUUID()}`,
      email: rawEmail,
      displayName,
      passwordHash,
      verificationToken,
      verificationExpiresAt,
    });

    res.status(201).json({
      pendingVerification: true,
      email: rawEmail,
      message:
        'Un e-mail de validation vient d’être envoyé via Brevo. Cliquez sur le lien reçu pour activer votre compte.',
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Impossible de créer le compte.';
    const status = message.includes('Brevo') ? 503 : 500;
    res.status(status).json({ error: message });
  }
});

// Email & Password Login
app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const rawEmail = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!EMAIL_REGEX.test(rawEmail) || !password) {
      return res.status(400).json({ error: 'E-mail et mot de passe requis.' });
    }

    const user = await findUserByEmail(rawEmail);
    if (!user) {
      return res.status(401).json({ error: 'Identifiants incorrects.' });
    }

    if (user.authProvider === 'google' && !user.passwordHash) {
      return res.status(400).json({
        error: 'Ce compte est lié à Google. Cliquez sur « Continuer avec Google ».',
      });
    }

    if (!verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Identifiants incorrects.' });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        error:
          'Votre adresse e-mail n’est pas encore validée. Consultez votre boîte de réception ou renvoyez le lien.',
        needsVerification: true,
        email: user.email,
      });
    }

    const token = createSessionToken({
      uid: user.uid,
      email: user.email,
      name: user.displayName,
    });

    res.json({
      token,
      user: toPublicUserProfile(user),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur de connexion.';
    res.status(500).json({ error: message });
  }
});

// Verify Email Token from Brevo Link
app.post('/api/auth/verify-email', authLimiter, async (req, res) => {
  try {
    const token = typeof req.body.token === 'string' ? req.body.token.trim() : '';
    if (!token) {
      return res.status(400).json({ error: 'Jeton de validation manquant.' });
    }

    const user = await findUserByVerificationToken(token);
    if (!user) {
      return res.status(404).json({
        error: 'Ce lien de validation est invalide ou a déjà été utilisé.',
      });
    }

    if (user.verificationExpiresAt && user.verificationExpiresAt.getTime() < Date.now()) {
      return res.status(410).json({
        error: 'Ce lien de validation a expiré. Demandez un nouvel e-mail de confirmation.',
        expired: true,
        email: user.email,
      });
    }

    const verified = await markUserEmailVerified(user.id);
    const sessionToken = createSessionToken({
      uid: verified.uid,
      email: verified.email,
      name: verified.displayName,
    });

    res.json({
      verified: true,
      token: sessionToken,
      user: toPublicUserProfile(verified),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur de validation.';
    res.status(500).json({ error: message });
  }
});

// Resend Verification Email via Brevo
app.post('/api/auth/resend-verification', authLimiter, async (req, res) => {
  try {
    const rawEmail = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    if (!EMAIL_REGEX.test(rawEmail)) {
      return res.status(400).json({ error: 'Adresse e-mail invalide.' });
    }

    const user = await findUserByEmail(rawEmail);
    if (!user) {
      return res.status(404).json({ error: 'Aucun compte trouvé pour cet e-mail.' });
    }
    if (user.emailVerified) {
      return res.status(400).json({ error: 'Cette adresse e-mail est déjà validée.' });
    }

    const verificationToken = generateVerificationToken();
    const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const appOrigin = resolveAppOrigin(req);
    const verifyUrl = `${appOrigin}/?verify_email=${encodeURIComponent(verificationToken)}`;

    await sendBrevoVerificationEmail({
      toEmail: user.email,
      toName: user.displayName,
      verifyUrl,
    });

    await updateUserVerificationToken(user.id, verificationToken, verificationExpiresAt);

    res.json({
      sent: true,
      message: 'Nouvel e-mail de validation envoyé via Brevo.',
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Impossible de renvoyer l’e-mail.';
    const status = message.includes('Brevo') ? 503 : 500;
    res.status(status).json({ error: message });
  }
});

// Brands CRUD
app.get('/api/brands', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await getOrCreateUser(
      req.user!.uid,
      req.user!.email || '',
      (req.user!.name as string | undefined) ?? null
    );
    const items = await listUserBrands(user.id);
    res.json({ brands: items, plan: user.plan });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    res.status(500).json({ error: message });
  }
});

app.post('/api/brands', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await getOrCreateUser(
      req.user!.uid,
      req.user!.email || '',
      (req.user!.name as string | undefined) ?? null
    );
    const payload = req.body.brand as BrandBookData;
    const bumpVersion = Boolean(req.body.bumpVersion);

    if (!payload || !payload.name) {
      return res.status(400).json({ error: 'Le nom de la marque est requis.' });
    }

    if (!payload.id && user.plan === 'free' && user.role !== 'admin') {
      const existingCount = await countUserBrands(user.id);
      if (existingCount >= 1) {
        return res.status(403).json({
          error:
            'L’offre Gratuite est limitée à 1 charte graphique enregistrée. Passez à l’offre Pro pour des chartes illimitées.',
          upgradeRequired: true,
        });
      }
    }

    const saved = await saveBrandBook(user.id, payload, { bumpVersion });
    res.json({ brand: saved });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la sauvegarde';
    res.status(500).json({ error: message });
  }
});

app.get('/api/brands/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await getOrCreateUser(req.user!.uid, req.user!.email || '');
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: 'Identifiant invalide.' });
    }
    const brand = await getBrandById(id, user.id);
    if (!brand) {
      return res.status(404).json({ error: 'Charte graphique introuvable.' });
    }
    res.json({ brand });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    res.status(500).json({ error: message });
  }
});

app.delete('/api/brands/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await getOrCreateUser(req.user!.uid, req.user!.email || '');
    const id = Number(req.params.id);
    const ok = await deleteBrandBook(id, user.id);
    if (!ok) {
      return res.status(404).json({ error: 'Charte introuvable.' });
    }
    res.json({ deleted: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la suppression';
    res.status(500).json({ error: message });
  }
});

app.post('/api/brands/:id/duplicate', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await getOrCreateUser(req.user!.uid, req.user!.email || '');
    if (user.plan === 'free' && user.role !== 'admin') {
      const count = await countUserBrands(user.id);
      if (count >= 1) {
        return res.status(403).json({
          error: 'Passez à l’offre Pro pour dupliquer et gérer plusieurs chartes.',
          upgradeRequired: true,
        });
      }
    }
    const id = Number(req.params.id);
    const cloned = await duplicateBrandBook(id, user.id);
    if (!cloned) {
      return res.status(404).json({ error: 'Charte introuvable.' });
    }
    res.json({ brand: cloned });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la duplication';
    res.status(500).json({ error: message });
  }
});

app.post('/api/brands/:id/share', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await getOrCreateUser(req.user!.uid, req.user!.email || '');
    const id = Number(req.params.id);
    const days = Number(req.body.daysValid) || 14;
    const share = await createShareToken(id, user.id, days);
    if (!share) {
      return res.status(404).json({ error: 'Charte introuvable.' });
    }
    res.json(share);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur de partage';
    res.status(500).json({ error: message });
  }
});

app.get('/api/share/:token', async (req, res) => {
  try {
    const brand = await getBrandByShareToken(req.params.token);
    if (!brand) {
      return res.status(404).json({ error: 'Lien de partage invalide ou expiré.' });
    }
    res.json({ brand });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    res.status(500).json({ error: message });
  }
});

// Logo upload & processing
app.post('/api/upload/logo', uploadLimiter, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier reçu.' });
    }
    const variantType = (req.body.variantType || 'primary') as LogoVariantType;
    const result = await processUploadedLogo(
      req.file.buffer,
      req.file.originalname,
      variantType
    );
    res.json(result);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Échec de l’analyse du logo.';
    res.status(400).json({ error: message });
  }
});

app.post('/api/upload/logo-crop', uploadLimiter, async (req, res) => {
  try {
    const { dataUrl, crop } = req.body as {
      dataUrl: string;
      crop: { x: number; y: number; width: number; height: number };
    };
    if (!dataUrl || !crop) {
      return res.status(400).json({ error: 'Paramètres de recadrage manquants.' });
    }
    const monogram = await cropLogoToMonogram(dataUrl, crop);
    res.json({ monogram });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Impossible de recadrer le logo.';
    res.status(400).json({ error: message });
  }
});

// Font upload & WOFF2 conversion
app.post('/api/upload/font', uploadLimiter, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier de police reçu.' });
    }
    const role = (req.body.role || 'heading') as FontRole;
    const fontAsset = await processUploadedFont(
      req.file.buffer,
      req.file.originalname,
      role
    );
    res.json({ font: fontAsset });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Échec de l’analyse de la police.';
    res.status(400).json({ error: message });
  }
});

// AI copywriting via Gemini
app.post('/api/ai/section-copy', exportLimiter, async (req, res) => {
  try {
    const { brandName, sector, baseline, description, values, language, sectionId } =
      req.body as {
        brandName: string;
        sector: string;
        baseline: string;
        description: string;
        values: string[];
        language: 'fr' | 'en';
        sectionId: SectionId;
      };
    const copy = await generateSectionIntroCopy({
      brandName: brandName || 'Marque',
      sector: sector || '',
      baseline: baseline || '',
      description: description || '',
      values: values || [],
      language: language || 'fr',
      sectionId,
    });
    res.json({ copy });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Impossible de générer le texte via l’IA.';
    res.status(500).json({ error: message });
  }
});

// PDF & ZIP Exports
app.post('/api/export/pdf', exportLimiter, optionalAuth, async (req: AuthRequest, res) => {
  try {
    const brand = req.body.brand as BrandBookData;
    if (!brand || !brand.name) {
      return res.status(400).json({ error: 'Données de marque manquantes.' });
    }

    let isPro = false;
    if (req.user) {
      const user = await getOrCreateUser(req.user.uid, req.user.email || '');
      isPro = user.plan === 'pro' || user.role === 'admin';
    }

    const pdfBuffer = await generateBrandBookPdf(brand, {
      showWatermark: !isPro,
    });
    const filename = `charte-${slugify(brand.name)}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdfBuffer);
  } catch (error: unknown) {
    console.error('PDF export error:', error);
    const message =
      error instanceof Error ? error.message : 'Erreur lors de la génération PDF.';
    res.status(500).json({ error: message });
  }
});

app.post('/api/export/zip', exportLimiter, optionalAuth, async (req: AuthRequest, res) => {
  try {
    const brand = req.body.brand as BrandBookData;
    if (!brand || !brand.name) {
      return res.status(400).json({ error: 'Données de marque manquantes.' });
    }

    let isPro = false;
    if (req.user) {
      const user = await getOrCreateUser(req.user.uid, req.user.email || '');
      isPro = user.plan === 'pro' || user.role === 'admin';
    }

    const zipBuffer = await buildBrandExportZip(brand, {
      showWatermark: !isPro,
      includePdf: true,
    });
    const filename = `brand-kit-${slugify(brand.name)}.zip`;
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(zipBuffer);
  } catch (error: unknown) {
    console.error('ZIP export error:', error);
    const message =
      error instanceof Error ? error.message : 'Erreur lors de la génération du pack ZIP.';
    res.status(500).json({ error: message });
  }
});

// Billing (Stripe Checkout ready + instant test activation when key absent)
app.post('/api/billing/checkout', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await getOrCreateUser(req.user!.uid, req.user!.email || '');
    const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();
    const appUrl = resolveAppOrigin(req);

    if (stripeKey && stripeKey.startsWith('sk_')) {
      const body = new URLSearchParams({
        mode: 'subscription',
        success_url: `${appUrl}/?upgrade=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/?upgrade=cancel`,
        customer_email: user.email,
        client_reference_id: String(user.id),
        'line_items[0][price_data][currency]': 'eur',
        'line_items[0][price_data][unit_amount]': '500',
        'line_items[0][price_data][recurring][interval]': 'month',
        'line_items[0][price_data][product_data][name]': 'CharteForge Pro',
        'line_items[0][quantity]': '1',
      });

      const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${stripeKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });
      const session = (await stripeRes.json()) as { url?: string; error?: { message: string } };
      if (!stripeRes.ok || !session.url) {
        return res.status(400).json({
          error: session.error?.message || 'Erreur Stripe Checkout.',
        });
      }
      return res.json({ checkoutUrl: session.url });
    }

    await setUserPlan(user.id, 'pro', `cus_demo_${user.id}`);
    res.json({ upgraded: true, plan: 'pro' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur de facturation';
    res.status(500).json({ error: message });
  }
});

app.post('/api/billing/confirm', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await getOrCreateUser(req.user!.uid, req.user!.email || '');
    const sessionId = typeof req.body.sessionId === 'string' ? req.body.sessionId.trim() : '';
    const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();

    if (!stripeKey || !stripeKey.startsWith('sk_')) {
      return res.status(400).json({ error: 'Clé Stripe non configurée.' });
    }
    if (!sessionId) {
      return res.status(400).json({ error: 'Identifiant de session Stripe manquant.' });
    }

    const stripeRes = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
      {
        headers: {
          Authorization: `Bearer ${stripeKey}`,
        },
      }
    );
    const session = (await stripeRes.json()) as {
      status?: string;
      payment_status?: string;
      customer?: string;
      subscription?: string;
      customer_email?: string;
      client_reference_id?: string;
      error?: { message: string };
    };

    if (!stripeRes.ok) {
      return res.status(400).json({
        error: session.error?.message || 'Session Stripe introuvable.',
      });
    }

    const belongsToUser =
      session.client_reference_id === String(user.id) ||
      session.customer_email?.toLowerCase() === user.email.toLowerCase();

    if (!belongsToUser) {
      return res.status(403).json({ error: 'Cette session Stripe ne correspond pas à votre compte.' });
    }

    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      return res.status(402).json({ error: 'Le paiement Stripe n’est pas encore finalisé.' });
    }

    await setUserPlan(user.id, 'pro', session.customer, session.subscription);
    res.json({ upgraded: true, plan: 'pro' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur de confirmation Stripe';
    res.status(500).json({ error: message });
  }
});

app.post('/api/billing/downgrade', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await getOrCreateUser(req.user!.uid, req.user!.email || '');
    await setUserPlan(user.id, 'free');
    res.json({ plan: 'free' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur de mise à jour';
    res.status(500).json({ error: message });
  }
});

// Admin endpoints
app.get('/api/admin/overview', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await getOrCreateUser(req.user!.uid, req.user!.email || '');
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès réservé aux administrateurs.' });
    }
    const overview = await getAdminStats();
    res.json(overview);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur admin';
    res.status(500).json({ error: message });
  }
});

app.post('/api/admin/config', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await getOrCreateUser(req.user!.uid, req.user!.email || '');
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès réservé aux administrateurs.' });
    }
    await saveAdminConfig(req.body.config || {});
    res.json({ saved: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur admin';
    res.status(500).json({ error: message });
  }
});

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function injectRouteSeoHtml(template: string, req: Request): string {
  const origin = resolveAppOrigin(req);
  const hasShare = typeof req.query.share === 'string' && req.query.share.length > 0;
  const routeKey = resolveRouteKeyFromPath(req.path, hasShare);
  const meta = ROUTE_SEO_META[routeKey] ?? ROUTE_SEO_META.landing;
  const canonicalUrl = `${origin}${meta.path}`;
  const ogImageUrl = `${origin}${OG_IMAGE_PATH}`;
  const jsonLd = JSON.stringify(buildStructuredDataGraph(origin)).replace(
    /<\//g,
    '<\\/'
  );

  const safeTitle = escapeHtmlAttr(meta.title);
  const safeDesc = escapeHtmlAttr(meta.description);
  const safeRobots = escapeHtmlAttr(meta.robots);
  const safeCanonical = escapeHtmlAttr(canonicalUrl);
  const safeOgImage = escapeHtmlAttr(ogImageUrl);

  return template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${safeTitle}</title>`)
    .replace(
      /<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/,
      `<meta name="robots" content="${safeRobots}" />`
    )
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
      `<meta name="description" content="${safeDesc}" />`
    )
    .replace(
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
      `<link rel="canonical" href="${safeCanonical}" />`
    )
    .replace(
      /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:title" content="${safeTitle}" />`
    )
    .replace(
      /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:description" content="${safeDesc}" />`
    )
    .replace(
      /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:url" content="${safeCanonical}" />`
    )
    .replace(
      /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:image" content="${safeOgImage}" />`
    )
    .replace(
      /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
      `<meta name="twitter:title" content="${safeTitle}" />`
    )
    .replace(
      /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
      `<meta name="twitter:description" content="${safeDesc}" />`
    )
    .replace(
      /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/,
      `<meta name="twitter:image" content="${safeOgImage}" />`
    )
    .replace(
      /<script id="charteforge-jsonld" type="application\/ld\+json">[\s\S]*?<\/script>/,
      `<script id="charteforge-jsonld" type="application/ld+json">${jsonLd}</script>`
    );
}

function isSpaHtmlRequest(req: Request): boolean {
  if (req.method !== 'GET') return false;
  if (
    req.path.startsWith('/api') ||
    req.path.startsWith('/@') ||
    req.path.startsWith('/src/') ||
    req.path.startsWith('/node_modules/')
  ) {
    return false;
  }
  if (path.extname(req.path)) return false;
  const accept = req.headers.accept || '';
  return accept.includes('text/html') || accept.includes('*/*');
}

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        ws: false,
        allowedHosts: true,
        cors: true,
      },
      appType: 'spa',
    });

    app.get('/@vite/client', (_req, res) => {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.send(`
const sheetsMap = new Map();
function updateStyle(id, content) {
  let style = sheetsMap.get(id);
  if (!style) {
    style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.setAttribute('data-vite-dev-id', id);
    style.textContent = content;
    document.head.appendChild(style);
    sheetsMap.set(id, style);
  } else if (style.textContent !== content) {
    style.textContent = content;
  }
}
function removeStyle(id) {
  const style = sheetsMap.get(id);
  if (style) {
    style.remove();
    sheetsMap.delete(id);
  }
}
function createHotContext() {
  return {
    data: {},
    accept() {},
    acceptExports() {},
    dispose() {},
    prune() {},
    decline() {},
    invalidate() {},
    on() {},
    off() {},
    send() {},
  };
}
function injectQuery(url, queryToInject) {
  if (url[0] !== '.' && url[0] !== '/') return url;
  const pathname = url.replace(/[?#].*$/, '');
  const { search, hash } = new URL(url, 'http://vite.dev');
  return pathname + '?' + queryToInject + (search ? '&' + search.slice(1) : '') + (hash || '');
}
class ErrorOverlay extends HTMLElement {}
export { ErrorOverlay, createHotContext, injectQuery, removeStyle, updateStyle };
`.trim());
    });

    app.use(async (req, res, next) => {
      if (!isSpaHtmlRequest(req)) return next();
      try {
        const rawHtml = fs.readFileSync(
          path.resolve(process.cwd(), 'index.html'),
          'utf-8'
        );
        const withSeo = injectRouteSeoHtml(rawHtml, req);
        const transformed = await vite.transformIndexHtml(req.originalUrl, withSeo);
        res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' }).end(transformed);
      } catch (err) {
        next(err);
      }
    });

    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    const distHtmlPath = path.join(distDir, 'index.html');
    app.use(express.static(distDir, { index: false }));
    app.get('*', (req, res) => {
      const rawHtml = fs.readFileSync(distHtmlPath, 'utf-8');
      const withSeo = injectRouteSeoHtml(rawHtml, req);
      res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' }).send(withSeo);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CharteForge server listening on http://localhost:${PORT}`);
  });
}

startServer();
