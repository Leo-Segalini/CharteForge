import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { verifySessionToken } from '../server/emailAuthService.ts';

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  name?: string;
  authProvider?: 'google' | 'email';
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

async function resolveToken(token: string): Promise<AuthenticatedUser | null> {
  if (token.startsWith('cf.')) {
    const session = verifySessionToken(token);
    if (!session) return null;
    return {
      uid: session.uid,
      email: session.email,
      name: session.name ?? undefined,
      authProvider: 'email',
    };
  }

  const decoded = await adminAuth.verifyIdToken(token);
  return {
    uid: decoded.uid,
    email: decoded.email,
    name: typeof decoded.name === 'string' ? decoded.name : undefined,
    authProvider: 'google',
  };
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentification requise.' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const resolved = await resolveToken(token);
    if (!resolved) {
      return res.status(401).json({ error: 'Session expirée ou invalide.' });
    }
    req.user = resolved;
    next();
  } catch (error) {
    console.error('Error verifying auth token:', error);
    return res.status(401).json({ error: 'Session expirée ou invalide.' });
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1];
    try {
      const resolved = await resolveToken(token);
      if (resolved) {
        req.user = resolved;
      }
    } catch {
      // Ignore invalid optional token
    }
  }
  next();
};
