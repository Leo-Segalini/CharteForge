import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name'),
  authProvider: text('auth_provider').notNull().default('google'),
  passwordHash: text('password_hash'),
  emailVerified: boolean('email_verified').notNull().default(true),
  verificationToken: text('verification_token'),
  verificationExpiresAt: timestamp('verification_expires_at'),
  role: text('role').notNull().default('user'),
  plan: text('plan').notNull().default('free'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const brands = pgTable('brands', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  baseline: text('baseline').default(''),
  sector: text('sector').default(''),
  description: text('description').default(''),
  values: jsonb('values').$type<string[]>().default([]).notNull(),
  language: text('language').notNull().default('fr'),
  status: text('status').notNull().default('draft'),
  typeScale: jsonb('type_scale').$type<Record<string, unknown>>().notNull(),
  gradients: jsonb('gradients').$type<unknown[]>().default([]).notNull(),
  gridConfig: jsonb('grid_config').$type<Record<string, unknown>>().notNull(),
  iconConfig: jsonb('icon_config').$type<Record<string, unknown>>().notNull(),
  protectionConfig: jsonb('protection_config').$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const logoAssets = pgTable('logo_assets', {
  id: serial('id').primaryKey(),
  brandId: integer('brand_id')
    .references(() => brands.id, { onDelete: 'cascade' })
    .notNull(),
  variantType: text('variant_type').notNull(),
  origin: text('origin').notNull().default('uploaded'),
  mimeType: text('mime_type').notNull(),
  width: integer('width').default(0),
  height: integer('height').default(0),
  hasTransparency: boolean('has_transparency').default(true),
  qualityWarnings: jsonb('quality_warnings').$type<string[]>().default([]).notNull(),
  dataUrl: text('data_url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const colorTokens = pgTable('color_tokens', {
  id: serial('id').primaryKey(),
  brandId: integer('brand_id')
    .references(() => brands.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  role: text('role').notNull(),
  hex: text('hex').notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
});

export const fontAssets = pgTable('font_assets', {
  id: serial('id').primaryKey(),
  brandId: integer('brand_id')
    .references(() => brands.id, { onDelete: 'cascade' })
    .notNull(),
  family: text('family').notNull(),
  role: text('role').notNull(),
  source: text('source').notNull().default('google'),
  weights: jsonb('weights').$type<string[]>().default(['400', '600', '700']).notNull(),
  fallback: text('fallback').default('sans-serif').notNull(),
  woff2DataUrl: text('woff2_data_url'),
  originalFormat: text('original_format'),
  coverage: jsonb('coverage').$type<Record<string, unknown>>().default({}).notNull(),
  rightsConfirmed: boolean('rights_confirmed').default(false).notNull(),
});

export const guidelines = pgTable('guidelines', {
  id: serial('id').primaryKey(),
  brandId: integer('brand_id')
    .references(() => brands.id, { onDelete: 'cascade' })
    .notNull(),
  template: text('template').notNull().default('classic'),
  format: text('format').notNull().default('landscape'),
  enabledSections: jsonb('enabled_sections').$type<string[]>().default([]).notNull(),
  sectionCopy: jsonb('section_copy').$type<Record<string, string>>().default({}).notNull(),
  version: integer('version').default(1).notNull(),
  status: text('status').notNull().default('draft'),
  shareToken: text('share_token'),
  shareExpiresAt: timestamp('share_expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  plan: text('plan').notNull().default('free'),
  status: text('status').notNull().default('active'),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  currentPeriodEnd: timestamp('current_period_end'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const adminConfigs = pgTable('admin_configs', {
  id: serial('id').primaryKey(),
  configKey: text('config_key').notNull().unique(),
  payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  brands: many(brands),
  subscriptions: many(subscriptions),
}));

export const brandsRelations = relations(brands, ({ one, many }) => ({
  owner: one(users, {
    fields: [brands.userId],
    references: [users.id],
  }),
  logos: many(logoAssets),
  colors: many(colorTokens),
  fonts: many(fontAssets),
  guidelines: many(guidelines),
}));

export const logoAssetsRelations = relations(logoAssets, ({ one }) => ({
  brand: one(brands, {
    fields: [logoAssets.brandId],
    references: [brands.id],
  }),
}));

export const colorTokensRelations = relations(colorTokens, ({ one }) => ({
  brand: one(brands, {
    fields: [colorTokens.brandId],
    references: [brands.id],
  }),
}));

export const fontAssetsRelations = relations(fontAssets, ({ one }) => ({
  brand: one(brands, {
    fields: [fontAssets.brandId],
    references: [brands.id],
  }),
}));

export const guidelinesRelations = relations(guidelines, ({ one }) => ({
  brand: one(brands, {
    fields: [guidelines.brandId],
    references: [brands.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));
