import { eq, sql } from 'drizzle-orm';
import { db } from './index.ts';
import { users } from './schema.ts';
import type { UserProfile } from '../shared/types.ts';

export type DbUser = typeof users.$inferSelect;

export function toPublicUserProfile(user: DbUser): UserProfile {
  return {
    id: user.id,
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    role: user.role === 'admin' ? 'admin' : 'user',
    plan: user.plan === 'pro' ? 'pro' : 'free',
  };
}

export async function getOrCreateUser(
  uid: string,
  email: string,
  displayName?: string | null,
  authProvider: 'google' | 'email' = 'google'
) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid,
        email: email.toLowerCase().trim(),
        displayName: displayName ?? null,
        authProvider,
        emailVerified: true,
        role: email.toLowerCase().trim() === 'leo.segalini@gmail.com' ? 'admin' : 'user',
        plan: 'free',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email: email.toLowerCase().trim(),
          ...(displayName ? { displayName } : {}),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database user upsert failed:', error);
    const existing = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    if (existing[0]) {
      return existing[0];
    }
    throw new Error('Impossible de synchroniser le compte utilisateur.', { cause: error });
  }
}

export async function findUserByEmail(email: string): Promise<DbUser | null> {
  const normalized = email.toLowerCase().trim();
  const rows = await db
    .select()
    .from(users)
    .where(sql`lower(${users.email}) = ${normalized}`)
    .limit(1);
  return rows[0] ?? null;
}

export async function findUserByVerificationToken(token: string): Promise<DbUser | null> {
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.verificationToken, token))
    .limit(1);
  return rows[0] ?? null;
}

export async function upsertEmailUserPendingVerification(params: {
  uid: string;
  email: string;
  displayName: string | null;
  passwordHash: string;
  verificationToken: string;
  verificationExpiresAt: Date;
}): Promise<DbUser> {
  const normalizedEmail = params.email.toLowerCase().trim();
  const existing = await findUserByEmail(normalizedEmail);

  if (existing) {
    const [updated] = await db
      .update(users)
      .set({
        displayName: params.displayName ?? existing.displayName,
        passwordHash: params.passwordHash,
        verificationToken: params.verificationToken,
        verificationExpiresAt: params.verificationExpiresAt,
        emailVerified: false,
      })
      .where(eq(users.id, existing.id))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(users)
    .values({
      uid: params.uid,
      email: normalizedEmail,
      displayName: params.displayName,
      authProvider: 'email',
      passwordHash: params.passwordHash,
      emailVerified: false,
      verificationToken: params.verificationToken,
      verificationExpiresAt: params.verificationExpiresAt,
      role: normalizedEmail === 'leo.segalini@gmail.com' ? 'admin' : 'user',
      plan: 'free',
    })
    .returning();
  return created;
}

export async function updateUserVerificationToken(
  userId: number,
  verificationToken: string,
  verificationExpiresAt: Date
): Promise<DbUser> {
  const [updated] = await db
    .update(users)
    .set({
      verificationToken,
      verificationExpiresAt,
    })
    .where(eq(users.id, userId))
    .returning();
  return updated;
}

export async function markUserEmailVerified(userId: number): Promise<DbUser> {
  const [updated] = await db
    .update(users)
    .set({
      emailVerified: true,
      verificationToken: null,
      verificationExpiresAt: null,
    })
    .where(eq(users.id, userId))
    .returning();
  return updated;
}
