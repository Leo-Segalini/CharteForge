import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import type { UserProfile } from '../shared/types.ts';

const EMAIL_TOKEN_KEY = 'charteforge_email_session_v1';

export interface EmailAuthResult {
  ok: boolean;
  error?: string;
  needsVerification?: boolean;
  pendingVerification?: boolean;
  expired?: boolean;
  email?: string;
  message?: string;
}

interface AuthContextValue {
  firebaseUser: FirebaseUser | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  authError: string | null;
  getIdToken: () => Promise<string | null>;
  loginWithGoogle: () => Promise<boolean>;
  loginWithEmail: (email: string, password: string) => Promise<EmailAuthResult>;
  registerWithEmail: (
    displayName: string,
    email: string,
    password: string
  ) => Promise<EmailAuthResult>;
  verifyEmailToken: (token: string) => Promise<EmailAuthResult>;
  resendVerificationEmail: (email: string) => Promise<EmailAuthResult>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [emailToken, setEmailToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(EMAIL_TOKEN_KEY);
    } catch {
      return null;
    }
  });
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const persistEmailToken = (token: string | null) => {
    setEmailToken(token);
    try {
      if (token) {
        localStorage.setItem(EMAIL_TOKEN_KEY, token);
      } else {
        localStorage.removeItem(EMAIL_TOKEN_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  };

  const syncGoogleUser = async (user: FirebaseUser) => {
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = (await res.json()) as { user: UserProfile };
        setProfile(data.user);
      }
    } catch (err) {
      console.error('Auth sync error:', err);
    }
  };

  const restoreEmailSession = async (token: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = (await res.json()) as { user: UserProfile };
        setProfile(data.user);
      } else {
        persistEmailToken(null);
        setProfile(null);
      }
    } catch {
      // Keep token on transient network error
    }
  };

  useEffect(() => {
    let mounted = true;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!mounted) return;
      setFirebaseUser(user);
      if (user) {
        persistEmailToken(null);
        await syncGoogleUser(user);
        if (mounted) setLoading(false);
      } else {
        const savedToken = (() => {
          try {
            return localStorage.getItem(EMAIL_TOKEN_KEY);
          } catch {
            return null;
          }
        })();
        if (savedToken) {
          await restoreEmailSession(savedToken);
        } else {
          setProfile(null);
        }
        if (mounted) setLoading(false);
      }
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const getIdToken = async (): Promise<string | null> => {
    if (firebaseUser) {
      return firebaseUser.getIdToken();
    }
    if (emailToken) {
      return emailToken;
    }
    return null;
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    setAuthError(null);
    try {
      const cred = await signInWithPopup(auth, googleAuthProvider);
      if (cred.user) {
        persistEmailToken(null);
        await syncGoogleUser(cred.user);
        return true;
      }
      return false;
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Échec de la connexion Google.';
      setAuthError(msg);
      return false;
    }
  };

  const loginWithEmail = async (
    email: string,
    password: string
  ): Promise<EmailAuthResult> => {
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return {
          ok: false,
          error: data.error || 'Connexion impossible.',
          needsVerification: Boolean(data.needsVerification),
          email: data.email,
        };
      }
      if (firebaseUser) {
        await signOut(auth);
      }
      persistEmailToken(data.token as string);
      setProfile(data.user as UserProfile);
      return { ok: true };
    } catch (err: unknown) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : 'Erreur réseau.',
      };
    }
  };

  const registerWithEmail = async (
    displayName: string,
    email: string,
    password: string
  ): Promise<EmailAuthResult> => {
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return {
          ok: false,
          error: data.error || 'Création de compte impossible.',
        };
      }
      return {
        ok: true,
        pendingVerification: Boolean(data.pendingVerification),
        email: data.email,
        message: data.message,
      };
    } catch (err: unknown) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : 'Erreur réseau.',
      };
    }
  };

  const verifyEmailToken = async (token: string): Promise<EmailAuthResult> => {
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) {
        return {
          ok: false,
          error: data.error || 'Validation impossible.',
          expired: Boolean(data.expired),
          email: data.email,
        };
      }
      if (firebaseUser) {
        await signOut(auth);
      }
      persistEmailToken(data.token as string);
      setProfile(data.user as UserProfile);
      return { ok: true };
    } catch (err: unknown) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : 'Erreur réseau.',
      };
    }
  };

  const resendVerificationEmail = async (email: string): Promise<EmailAuthResult> => {
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error || 'Renvoi impossible.' };
      }
      return { ok: true, message: data.message };
    } catch (err: unknown) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : 'Erreur réseau.',
      };
    }
  };

  const logout = async () => {
    persistEmailToken(null);
    if (firebaseUser) {
      await signOut(auth);
    }
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (firebaseUser) {
      await syncGoogleUser(firebaseUser);
    } else if (emailToken) {
      await restoreEmailSession(emailToken);
    }
  };

  const isAuthenticated = Boolean(profile || firebaseUser || emailToken);

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        profile,
        isAuthenticated,
        loading,
        authError,
        getIdToken,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        verifyEmailToken,
        resendVerificationEmail,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth doit être utilisé dans AuthProvider');
  }
  return ctx;
}
