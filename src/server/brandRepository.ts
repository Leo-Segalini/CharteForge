import crypto from 'crypto';
import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from '../db/index.ts';
import {
  adminConfigs,
  brands,
  colorTokens,
  fontAssets,
  guidelines,
  logoAssets,
  subscriptions,
  users,
} from '../db/schema.ts';
import type {
  BrandBookData,
  ColorTokenData,
  DocumentFormat,
  DocumentLanguage,
  FontAssetData,
  FontCoverage,
  FontRole,
  GradientSpec,
  GridConfig,
  IconConfig,
  LayoutTemplate,
  LogoAssetData,
  LogoVariantType,
  ProtectionConfig,
  SectionId,
  TypeScaleConfig,
} from '../shared/types.ts';
import { ALL_SECTIONS, buildTypeScalePreset, getDefaultSectionCopy } from '../shared/brandbook/sections.ts';

export interface BrandSummary {
  id: number;
  name: string;
  baseline: string;
  sector: string;
  status: string;
  language: string;
  template: string;
  format: string;
  version: number;
  updatedAt: string;
  primaryColor: string;
  primaryLogoUrl: string | null;
}

export async function listUserBrands(userId: number): Promise<BrandSummary[]> {
  try {
    const userBrands = await db
      .select()
      .from(brands)
      .where(eq(brands.userId, userId))
      .orderBy(desc(brands.updatedAt));

    const results: BrandSummary[] = [];
    for (const b of userBrands) {
      const [latestGuideline] = await db
        .select()
        .from(guidelines)
        .where(eq(guidelines.brandId, b.id))
        .orderBy(desc(guidelines.version))
        .limit(1);

      const [primaryColor] = await db
        .select()
        .from(colorTokens)
        .where(and(eq(colorTokens.brandId, b.id), eq(colorTokens.role, 'primary')))
        .limit(1);

      const [primaryLogo] = await db
        .select()
        .from(logoAssets)
        .where(and(eq(logoAssets.brandId, b.id), eq(logoAssets.variantType, 'primary')))
        .limit(1);

      results.push({
        id: b.id,
        name: b.name,
        baseline: b.baseline ?? '',
        sector: b.sector ?? '',
        status: latestGuideline?.status ?? b.status,
        language: b.language,
        template: latestGuideline?.template ?? 'classic',
        format: latestGuideline?.format ?? 'landscape',
        version: latestGuideline?.version ?? 1,
        updatedAt: b.updatedAt.toISOString(),
        primaryColor: primaryColor?.hex ?? '#182B49',
        primaryLogoUrl: primaryLogo?.dataUrl ?? null,
      });
    }
    return results;
  } catch (error) {
    console.error('listUserBrands failed:', error);
    throw new Error('Impossible de charger les chartes graphiques.', { cause: error });
  }
}

async function hydrateBrand(brandRow: typeof brands.$inferSelect): Promise<BrandBookData> {
  const logosRows = await db
    .select()
    .from(logoAssets)
    .where(eq(logoAssets.brandId, brandRow.id));
  const colorRows = await db
    .select()
    .from(colorTokens)
    .where(eq(colorTokens.brandId, brandRow.id))
    .orderBy(colorTokens.sortOrder);
  const fontRows = await db
    .select()
    .from(fontAssets)
    .where(eq(fontAssets.brandId, brandRow.id));
  const [latestGuideline] = await db
    .select()
    .from(guidelines)
    .where(eq(guidelines.brandId, brandRow.id))
    .orderBy(desc(guidelines.version))
    .limit(1);

  const logos: LogoAssetData[] = logosRows.map((l) => ({
    id: l.id,
    variantType: l.variantType as LogoVariantType,
    origin: (l.origin === 'generated' ? 'generated' : 'uploaded') as 'uploaded' | 'generated',
    mimeType: l.mimeType,
    width: l.width ?? 0,
    height: l.height ?? 0,
    hasTransparency: l.hasTransparency ?? true,
    qualityWarnings: l.qualityWarnings ?? [],
    dataUrl: l.dataUrl,
  }));

  const colors: ColorTokenData[] = colorRows.map((c) => ({
    id: c.id,
    name: c.name,
    role: c.role,
    hex: c.hex,
    sortOrder: c.sortOrder,
  }));

  const fonts: FontAssetData[] = fontRows.map((f) => ({
    id: f.id,
    family: f.family,
    role: f.role as FontRole,
    source: (f.source === 'upload' ? 'upload' : 'google') as 'upload' | 'google',
    weights: f.weights ?? ['400', '700'],
    fallback: f.fallback,
    woff2DataUrl: f.woff2DataUrl,
    originalFormat: f.originalFormat,
    coverage: (f.coverage as unknown as FontCoverage) ?? {
      frenchAccents: true,
      euroSymbol: true,
      frenchQuotes: true,
      tabularDigits: true,
      glyphCount: 400,
      isVariable: false,
      variableAxes: [],
    },
    rightsConfirmed: f.rightsConfirmed,
  }));

  const lang: DocumentLanguage = brandRow.language === 'en' ? 'en' : 'fr';

  return {
    id: brandRow.id,
    name: brandRow.name,
    baseline: brandRow.baseline ?? '',
    sector: brandRow.sector ?? '',
    description: brandRow.description ?? '',
    values: brandRow.values ?? [],
    language: lang,
    status: brandRow.status === 'generated' ? 'generated' : 'draft',
    logos,
    colors,
    gradients: (brandRow.gradients as GradientSpec[]) ?? [],
    fonts,
    typeScale:
      (brandRow.typeScale as unknown as TypeScaleConfig) ??
      buildTypeScalePreset('balanced'),
    gridConfig: brandRow.gridConfig as unknown as GridConfig,
    iconConfig: brandRow.iconConfig as unknown as IconConfig,
    protectionConfig: brandRow.protectionConfig as unknown as ProtectionConfig,
    guideline: {
      id: latestGuideline?.id,
      template: (latestGuideline?.template ?? 'classic') as LayoutTemplate,
      format: (latestGuideline?.format ?? 'landscape') as DocumentFormat,
      enabledSections:
        (latestGuideline?.enabledSections as SectionId[]) ??
        ALL_SECTIONS.map((s) => s.id),
      sectionCopy:
        latestGuideline?.sectionCopy ?? getDefaultSectionCopy(lang),
      version: latestGuideline?.version ?? 1,
      status: latestGuideline?.status === 'generated' ? 'generated' : 'draft',
      shareToken: latestGuideline?.shareToken ?? null,
      shareExpiresAt: latestGuideline?.shareExpiresAt
        ? latestGuideline.shareExpiresAt.toISOString()
        : null,
    },
    updatedAt: brandRow.updatedAt.toISOString(),
  };
}

export async function getBrandById(
  brandId: number,
  userId: number
): Promise<BrandBookData | null> {
  try {
    const [row] = await db
      .select()
      .from(brands)
      .where(and(eq(brands.id, brandId), eq(brands.userId, userId)))
      .limit(1);
    if (!row) return null;
    return hydrateBrand(row);
  } catch (error) {
    console.error('getBrandById failed:', error);
    throw new Error('Erreur lors de la lecture de la charte.', { cause: error });
  }
}

export async function saveBrandBook(
  userId: number,
  data: BrandBookData,
  options: { bumpVersion?: boolean } = {}
): Promise<BrandBookData> {
  try {
    const now = new Date();
    let brandId = data.id;

    if (brandId) {
      const [existing] = await db
        .select()
        .from(brands)
        .where(and(eq(brands.id, brandId), eq(brands.userId, userId)))
        .limit(1);

      if (!existing) {
        brandId = undefined;
      } else {
        await db
          .update(brands)
          .set({
            name: data.name,
            baseline: data.baseline,
            sector: data.sector,
            description: data.description,
            values: data.values,
            language: data.language,
            status: data.status,
            typeScale: data.typeScale as unknown as Record<string, unknown>,
            gradients: data.gradients as unknown[],
            gridConfig: data.gridConfig as unknown as Record<string, unknown>,
            iconConfig: data.iconConfig as unknown as Record<string, unknown>,
            protectionConfig: data.protectionConfig as unknown as Record<string, unknown>,
            updatedAt: now,
          })
          .where(eq(brands.id, brandId));
      }
    }

    if (!brandId) {
      const [inserted] = await db
        .insert(brands)
        .values({
          userId,
          name: data.name,
          baseline: data.baseline,
          sector: data.sector,
          description: data.description,
          values: data.values,
          language: data.language,
          status: data.status,
          typeScale: data.typeScale as unknown as Record<string, unknown>,
          gradients: data.gradients as unknown[],
          gridConfig: data.gridConfig as unknown as Record<string, unknown>,
          iconConfig: data.iconConfig as unknown as Record<string, unknown>,
          protectionConfig: data.protectionConfig as unknown as Record<string, unknown>,
          updatedAt: now,
        })
        .returning();
      brandId = inserted.id;
    }

    // Replace logos, colors, fonts cleanly
    await db.delete(logoAssets).where(eq(logoAssets.brandId, brandId));
    if (data.logos.length > 0) {
      await db.insert(logoAssets).values(
        data.logos.map((l) => ({
          brandId: brandId!,
          variantType: l.variantType,
          origin: l.origin,
          mimeType: l.mimeType,
          width: l.width,
          height: l.height,
          hasTransparency: l.hasTransparency,
          qualityWarnings: l.qualityWarnings,
          dataUrl: l.dataUrl,
        }))
      );
    }

    await db.delete(colorTokens).where(eq(colorTokens.brandId, brandId));
    if (data.colors.length > 0) {
      await db.insert(colorTokens).values(
        data.colors.map((c, idx) => ({
          brandId: brandId!,
          name: c.name,
          role: c.role,
          hex: c.hex,
          sortOrder: idx,
        }))
      );
    }

    await db.delete(fontAssets).where(eq(fontAssets.brandId, brandId));
    if (data.fonts.length > 0) {
      await db.insert(fontAssets).values(
        data.fonts.map((f) => ({
          brandId: brandId!,
          family: f.family,
          role: f.role,
          source: f.source,
          weights: f.weights,
          fallback: f.fallback,
          woff2DataUrl: f.woff2DataUrl ?? null,
          originalFormat: f.originalFormat ?? null,
          coverage: f.coverage as unknown as Record<string, unknown>,
          rightsConfirmed: f.rightsConfirmed,
        }))
      );
    }

    const [latestGuideline] = await db
      .select()
      .from(guidelines)
      .where(eq(guidelines.brandId, brandId))
      .orderBy(desc(guidelines.version))
      .limit(1);

    if (!latestGuideline || options.bumpVersion) {
      const nextVersion = latestGuideline ? latestGuideline.version + 1 : 1;
      await db.insert(guidelines).values({
        brandId,
        template: data.guideline.template,
        format: data.guideline.format,
        enabledSections: data.guideline.enabledSections,
        sectionCopy: data.guideline.sectionCopy,
        version: nextVersion,
        status: data.guideline.status,
      });
    } else {
      await db
        .update(guidelines)
        .set({
          template: data.guideline.template,
          format: data.guideline.format,
          enabledSections: data.guideline.enabledSections,
          sectionCopy: data.guideline.sectionCopy,
          status: data.guideline.status,
        })
        .where(eq(guidelines.id, latestGuideline.id));
    }

    const updated = await getBrandById(brandId, userId);
    if (!updated) {
      throw new Error('Impossible de recharger la charte enregistrée.');
    }
    return updated;
  } catch (error) {
    console.error('saveBrandBook failed:', error);
    throw new Error('Erreur lors de la sauvegarde de la charte.', { cause: error });
  }
}

export async function duplicateBrandBook(
  brandId: number,
  userId: number
): Promise<BrandBookData | null> {
  const original = await getBrandById(brandId, userId);
  if (!original) return null;
  const clone: BrandBookData = {
    ...original,
    id: undefined,
    name: `${original.name} (Copie)`,
    status: 'draft',
    guideline: {
      ...original.guideline,
      id: undefined,
      version: 1,
      status: 'draft',
      shareToken: null,
      shareExpiresAt: null,
    },
  };
  return saveBrandBook(userId, clone);
}

export async function deleteBrandBook(
  brandId: number,
  userId: number
): Promise<boolean> {
  const deleted = await db
    .delete(brands)
    .where(and(eq(brands.id, brandId), eq(brands.userId, userId)))
    .returning({ id: brands.id });
  return deleted.length > 0;
}

export async function createShareToken(
  brandId: number,
  userId: number,
  daysValid = 14
): Promise<{ token: string; expiresAt: string } | null> {
  const [brand] = await db
    .select()
    .from(brands)
    .where(and(eq(brands.id, brandId), eq(brands.userId, userId)))
    .limit(1);
  if (!brand) return null;

  const [latest] = await db
    .select()
    .from(guidelines)
    .where(eq(guidelines.brandId, brandId))
    .orderBy(desc(guidelines.version))
    .limit(1);
  if (!latest) return null;

  const token = crypto.randomBytes(18).toString('base64url');
  const expiresAt = new Date(Date.now() + daysValid * 24 * 60 * 60 * 1000);

  await db
    .update(guidelines)
    .set({ shareToken: token, shareExpiresAt: expiresAt })
    .where(eq(guidelines.id, latest.id));

  return { token, expiresAt: expiresAt.toISOString() };
}

export async function getBrandByShareToken(
  token: string
): Promise<BrandBookData | null> {
  const [guide] = await db
    .select()
    .from(guidelines)
    .where(eq(guidelines.shareToken, token))
    .limit(1);
  if (!guide) return null;
  if (guide.shareExpiresAt && guide.shareExpiresAt.getTime() < Date.now()) {
    return null;
  }
  const [brandRow] = await db
    .select()
    .from(brands)
    .where(eq(brands.id, guide.brandId))
    .limit(1);
  if (!brandRow) return null;
  return hydrateBrand(brandRow);
}

export async function countUserBrands(userId: number): Promise<number> {
  const rows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(brands)
    .where(eq(brands.userId, userId));
  return rows[0]?.count ?? 0;
}

export async function setUserPlan(
  userId: number,
  plan: 'free' | 'pro',
  stripeCustomerId?: string,
  stripeSubscriptionId?: string
) {
  await db.update(users).set({ plan }).where(eq(users.id, userId));
  await db.insert(subscriptions).values({
    userId,
    plan,
    status: 'active',
    stripeCustomerId: stripeCustomerId ?? null,
    stripeSubscriptionId: stripeSubscriptionId ?? null,
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });
}

export async function getAdminStats() {
  const allUsers = await db
    .select({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      role: users.role,
      plan: users.plan,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(50);

  const [{ totalBrands }] = await db
    .select({ totalBrands: sql<number>`count(*)::int` })
    .from(brands);

  const [{ generatedGuidelines }] = await db
    .select({ generatedGuidelines: sql<number>`count(*)::int` })
    .from(guidelines)
    .where(eq(guidelines.status, 'generated'));

  const [configRow] = await db
    .select()
    .from(adminConfigs)
    .where(eq(adminConfigs.configKey, 'global_templates'))
    .limit(1);

  return {
    stats: {
      totalUsers: allUsers.length,
      totalBrands,
      generatedGuidelines,
    },
    users: allUsers,
    config: configRow?.payload ?? {
      enabledTemplates: ['classic', 'editorial', 'minimal'],
      defaultFormat: 'landscape',
    },
  };
}

export async function saveAdminConfig(payload: Record<string, unknown>) {
  await db
    .insert(adminConfigs)
    .values({
      configKey: 'global_templates',
      payload,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: adminConfigs.configKey,
      set: { payload, updatedAt: new Date() },
    });
}
