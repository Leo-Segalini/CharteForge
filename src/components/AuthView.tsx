import React, { useState } from 'react';
import { Eye, EyeOff, Mail, RefreshCw } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useAuth } from '../context/AuthContext.tsx';
import { BrandLogo } from './BrandLogo.tsx';

interface AuthViewProps {
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
  onGoToPricing?: () => void;
  verificationNotice?: {
    status: 'verifying' | 'verified' | 'error';
    message: string;
    email?: string;
  } | null;
}

export function AuthView({
  initialMode = 'login',
  onSuccess,
  onGoToPricing,
  verificationNotice,
}: AuthViewProps) {
  const {
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    resendVerificationEmail,
    authError,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setFormError(null);
    const ok = await loginWithGoogle();
    setGoogleLoading(false);
    if (ok) {
      onSuccess?.();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setInfoMsg(null);
    setSubmitting(true);

    if (mode === 'login') {
      const res = await loginWithEmail(email, password);
      setSubmitting(false);
      if (res.ok) {
        onSuccess?.();
        return;
      }
      if (res.needsVerification && res.email) {
        setPendingEmail(res.email);
      }
      setFormError(res.error || 'Connexion impossible.');
      return;
    }

    const res = await registerWithEmail(displayName, email, password);
    setSubmitting(false);
    if (!res.ok) {
      setFormError(res.error || 'Création de compte impossible.');
      return;
    }

    if (res.pendingVerification) {
      setPendingEmail(res.email || email);
      setInfoMsg(
        res.message ||
          'Un e-mail de confirmation a été envoyé via Brevo. Vérifiez votre boîte de réception.'
      );
    }
  };

  const handleResend = async (targetEmail: string) => {
    setResending(true);
    setFormError(null);
    const res = await resendVerificationEmail(targetEmail);
    setResending(false);
    if (res.ok) {
      setInfoMsg(res.message || 'E-mail de validation renvoyé.');
    } else {
      setFormError(res.error || 'Impossible de renvoyer l’e-mail.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-md py-6"
    >
      <div className="rounded-[1.5rem] border border-border-hairline bg-surface-canvas p-8 shadow-micro">
        <div className="mb-6 flex flex-col items-start gap-2">
          <BrandLogo size="sm" />
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-text-primary">
                {mode === 'login'
                  ? 'Accéder à votre studio'
                  : 'Créer un compte CharteForge'}
              </h1>
              <p className="mt-1 text-sm text-text-secondary">
                {mode === 'login'
                  ? 'Connectez-vous pour ouvrir le Studio, enregistrer vos chartes et exporter vos PDF.'
                  : 'Créez votre espace gratuit avec validation d’adresse e-mail par Brevo ou via Google.'}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {verificationNotice && (
          <div
            className={`mb-5 rounded-full border px-4 py-3 text-xs leading-relaxed ${
              verificationNotice.status === 'error'
                ? 'border-red-200 bg-red-50 text-red-900'
                : 'border-emerald-200 bg-emerald-50 text-emerald-900'
            }`}
          >
            <p>{verificationNotice.message}</p>
            {verificationNotice.status === 'error' && verificationNotice.email && (
              <button
                type="button"
                disabled={resending}
                onClick={() => void handleResend(verificationNotice.email!)}
                className="mt-2 inline-flex items-center gap-1.5 font-semibold underline"
              >
                <RefreshCw className="h-3 w-3" />
                Renvoyer un lien de validation
              </button>
            )}
          </div>
        )}

        {/* Mode Switcher */}
        <div className="mb-5 grid grid-cols-2 rounded-2xl bg-surface-muted p-1">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setFormError(null);
              setInfoMsg(null);
            }}
            className={`relative rounded-md py-2 text-xs font-semibold transition-colors ${
              mode === 'login'
                ? 'text-text-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {mode === 'login' && (
              <motion.span
                layoutId="auth-mode-pill"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                className="absolute inset-0 rounded-md bg-surface-canvas shadow-sm"
              />
            )}
            <span className="relative z-10">Connexion</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setFormError(null);
              setInfoMsg(null);
            }}
            className={`relative rounded-md py-2 text-xs font-semibold transition-colors ${
              mode === 'register'
                ? 'text-text-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {mode === 'register' && (
              <motion.span
                layoutId="auth-mode-pill"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                className="absolute inset-0 rounded-md bg-surface-canvas shadow-sm"
              />
            )}
            <span className="relative z-10">Créer un compte</span>
          </button>
        </div>

        {/* Google Sign-In */}
        <button
          type="button"
          disabled={googleLoading}
          onClick={() => void handleGoogle()}
          className="flex w-full items-center justify-center gap-2.5 rounded-full border border-border-hairline bg-surface-canvas px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface-subtle disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
            />
          </svg>
          {googleLoading ? 'Connexion Google…' : 'Continuer avec Google'}
        </button>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-border-hairline" />
          <span className="text-[11px] font-medium text-text-muted">
            ou avec votre e-mail
          </span>
          <div className="h-px flex-1 bg-border-hairline" />
        </div>

        {/* Pending Email Verification Box */}
        {pendingEmail && infoMsg ? (
          <div className="space-y-4 rounded-full border border-border-hairline bg-surface-subtle p-5 text-sm">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-text-secondary" />
              <div>
                <div className="font-semibold text-text-primary">
                  Validation requise par e-mail
                </div>
                <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                  {infoMsg}
                </p>
                <p className="mt-2 font-mono text-xs text-text-secondary">
                  {pendingEmail}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border-hairline">
              <button
                type="button"
                disabled={resending}
                onClick={() => void handleResend(pendingEmail)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-primary hover:underline disabled:opacity-50"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                {resending ? 'Envoi…' : 'Renvoyer l’e-mail'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPendingEmail(null);
                  setInfoMsg(null);
                  setMode('login');
                }}
                className="text-xs font-medium text-text-secondary hover:text-text-primary"
              >
                Retour à la connexion
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                  Nom ou studio (optionnel)
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Ex. Atelier Horizon"
                  className="w-full rounded-full border border-border-hairline bg-surface-canvas px-3 py-2 text-sm text-text-primary focus:border-violet focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                Adresse e-mail
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@entreprise.fr"
                className="w-full rounded-full border border-border-hairline bg-surface-canvas px-3 py-2 text-sm text-text-primary focus:border-violet focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                Mot de passe {mode === 'register' && '(8 caractères minimum)'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={mode === 'register' ? 8 : 1}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-full border border-border-hairline bg-surface-canvas py-2 pl-3 pr-10 text-sm text-text-primary focus:border-violet focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label="Afficher ou masquer le mot de passe"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {(formError || authError) && (
              <div className="rounded-full border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-800">
                <p>{formError || authError}</p>
                {pendingEmail && mode === 'login' && (
                  <button
                    type="button"
                    disabled={resending}
                    onClick={() => void handleResend(pendingEmail)}
                    className="mt-1.5 inline-flex items-center gap-1 font-semibold underline"
                  >
                    <RefreshCw className="h-3 w-3" />
                    {resending ? 'Envoi…' : 'Renvoyer l’e-mail de confirmation'}
                  </button>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-violet px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink disabled:opacity-50"
            >
              {submitting
                ? 'Traitement…'
                : mode === 'login'
                  ? 'Se connecter'
                  : 'Créer mon compte et valider par e-mail'}
            </button>
          </form>
        )}

        {onGoToPricing && (
          <div className="mt-6 border-t border-border-subtle pt-4 text-center text-xs text-text-muted">
            Consultez nos formules Gratuite et Pro sur la page{' '}
            <button
              type="button"
              onClick={onGoToPricing}
              className="font-semibold text-text-primary underline"
            >
              Tarifs
            </button>
            .
          </div>
        )}
      </div>
    </motion.div>
  );
}
