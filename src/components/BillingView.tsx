import React, { useState } from 'react';
import { ArrowRight, Check, ShieldCheck, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useAuth } from '../context/AuthContext.tsx';
import { Badge } from './ui/Badge.tsx';
import { Button } from './ui/Button.tsx';
import { cn } from '../lib/cn.ts';

interface BillingViewProps {
  onRequestAuth?: () => void;
  externalNotice?: string | null;
}

const FREE_FEATURES = [
  '1 charte graphique enregistrée',
  'Génération PDF avec filigrane discret',
  'Aperçu complet des 18 sections & contrôle WCAG',
] as const;

const PRO_FEATURES = [
  'Chartes & versions illimitées',
  'Export PDF haute fidélité sans filigrane',
  'Pack ZIP (tokens.css, Tailwind, JSON, logos, WOFF2)',
  'Liens de partage privés avec expiration',
] as const;

function FeatureItem({
  children,
  emphasized = false,
}: {
  children: React.ReactNode;
  emphasized?: boolean;
}) {
  return (
    <li className="flex items-start gap-3 text-sm leading-snug text-text-secondary">
      <span
        className={cn(
          'mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
          emphasized ? 'bg-violet text-white' : 'bg-violet-soft text-violet',
        )}
        aria-hidden
      >
        <Check className="h-3 w-3 stroke-[2.5]" />
      </span>
      <span className={emphasized ? 'text-text-primary' : undefined}>{children}</span>
    </li>
  );
}

export function BillingView({ onRequestAuth, externalNotice }: BillingViewProps) {
  const { isAuthenticated, profile, getIdToken, loginWithGoogle, refreshProfile } =
    useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  const isPro = profile?.plan === 'pro' || profile?.role === 'admin';
  const displayedMessage = message ?? externalNotice ?? null;

  const fade = reduceMotion
    ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      if (onRequestAuth) {
        onRequestAuth();
      } else {
        await loginWithGoogle();
      }
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const token = await getIdToken();
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors du paiement.');
      if (data.checkoutUrl) {
        window.location.assign(data.checkoutUrl);
        return;
      }
      await refreshProfile();
      setMessage('Votre compte est désormais activé sur l’offre Pro.');
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Erreur de facturation.');
    } finally {
      setLoading(false);
    }
  };

  const handleDowngrade = async () => {
    const token = await getIdToken();
    if (!token) return;
    setLoading(true);
    try {
      await fetch('/api/billing/downgrade', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      await refreshProfile();
      setMessage('Compte repassé sur l’offre Gratuite.');
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Impossible de rétrograder le compte.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative mx-auto max-w-5xl overflow-hidden">
      <div
        className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-violet-soft/60 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 top-24 h-56 w-56 rounded-full bg-[#FFF1EB]/70 blur-3xl"
        aria-hidden
      />

      <header className="relative mx-auto max-w-2xl pb-10 pt-2 text-center">
        <motion.div {...fade} transition={{ duration: 0.35 }}>
          <Badge tone="violet" className="gap-2 px-3 py-1.5 text-[13px]">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Tarifs simples, sans surprise
          </Badge>
        </motion.div>

        <motion.h1
          {...fade}
          transition={{ duration: 0.4, delay: 0.04 }}
          className="mt-5 text-[clamp(1.85rem,4vw,2.75rem)] font-extrabold leading-[1.1] tracking-[-0.04em] text-text-primary"
        >
          Choisissez le rythme{' '}
          <span className="text-violet">de votre studio</span>
        </motion.h1>

        <motion.p
          {...fade}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="mt-4 text-base leading-relaxed text-text-secondary"
        >
          Testez gratuitement le générateur, puis passez Pro pour livrer des dossiers clients
          sans filigrane — à partir de 5&nbsp;€ / mois.
        </motion.p>
      </header>

      {displayedMessage && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={reduceMotion ? false : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8 rounded-2xl border border-border-hairline bg-surface-canvas px-4 py-3 text-center text-sm text-text-primary shadow-micro"
        >
          {displayedMessage}
        </motion.div>
      )}

      <div className="relative grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 md:gap-6">
        {/* Free */}
        <motion.article
          {...fade}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col rounded-[1.5rem] border border-border-hairline bg-surface-canvas p-7 shadow-micro md:p-8"
          aria-labelledby="plan-free-title"
        >
          <div className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
            Pour découvrir
          </div>
          <h2 id="plan-free-title" className="mt-2 text-xl font-bold text-text-primary">
            Offre Gratuite
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Idéal pour explorer le studio et produire une première charte.
          </p>

          <div className="mt-6 flex items-baseline gap-1.5">
            <span className="font-mono text-4xl font-bold tracking-tight text-text-primary tabular-nums">
              0&nbsp;€
            </span>
            <span className="text-sm text-text-muted">/ mois</span>
          </div>

          <ul className="mt-8 flex flex-1 flex-col gap-3.5">
            {FREE_FEATURES.map((feature) => (
              <FeatureItem key={feature}>{feature}</FeatureItem>
            ))}
          </ul>

          <div className="mt-8">
            {isPro && isAuthenticated ? (
              <Button
                variant="outline"
                className="w-full"
                disabled={loading}
                onClick={() => void handleDowngrade()}
              >
                Revenir à l’offre Gratuite
              </Button>
            ) : (
              <div
                className="flex h-12 items-center justify-center rounded-full border border-border-hairline bg-surface-subtle text-sm font-semibold text-text-secondary"
                aria-current={!isPro && isAuthenticated ? 'true' : undefined}
              >
                {isAuthenticated ? 'Offre actuelle' : 'Inclus dès l’inscription'}
              </div>
            )}
          </div>
        </motion.article>

        {/* Pro — highlighted */}
        <motion.article
          {...fade}
          transition={{ duration: 0.4, delay: 0.16 }}
          className={cn(
            'relative flex flex-col rounded-[1.5rem] border-2 border-violet bg-surface-canvas p-7 shadow-overlay md:p-8',
            'md:-mt-2 md:mb-[-0.5rem] md:pt-9',
          )}
          aria-labelledby="plan-pro-title"
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge tone="ochre" className="px-3 py-1 shadow-micro">
              Recommandé
            </Badge>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-semibold uppercase tracking-[0.08em] text-violet">
              Pour studios & agences
            </div>
            {isPro && (
              <Badge tone="pass" dot>
                Actif
              </Badge>
            )}
          </div>

          <h2 id="plan-pro-title" className="mt-2 text-xl font-bold text-text-primary">
            Offre Pro
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Livrez des brand books clients propres, sans limite ni filigrane.
          </p>

          <div className="mt-6 flex items-baseline gap-1.5">
            <span className="font-mono text-4xl font-bold tracking-tight text-text-primary tabular-nums">
              5&nbsp;€
            </span>
            <span className="text-sm text-text-muted">/ mois</span>
          </div>

          <ul className="mt-8 flex flex-1 flex-col gap-3.5">
            {PRO_FEATURES.map((feature) => (
              <FeatureItem key={feature} emphasized>
                {feature}
              </FeatureItem>
            ))}
          </ul>

          <div className="mt-8">
            {isPro ? (
              <div className="flex h-12 items-center justify-center rounded-full bg-violet text-sm font-semibold text-white">
                Abonnement Pro actif
              </div>
            ) : (
              <Button
                size="lg"
                className="w-full"
                disabled={loading}
                onClick={() => void handleCheckout()}
              >
                {loading
                  ? 'Redirection Stripe…'
                  : isAuthenticated
                    ? 'Passer à Pro'
                    : 'Se connecter et activer Pro'}
                {!loading && <ArrowRight className="h-4 w-4" aria-hidden />}
              </Button>
            )}
          </div>
        </motion.article>
      </div>

      <motion.footer
        {...fade}
        transition={{ duration: 0.4, delay: 0.22 }}
        className="relative mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center text-sm text-text-secondary"
      >
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-violet" aria-hidden />
          Paiement sécurisé via Stripe
        </span>
        <span>Résiliation à tout moment</span>
        <span>Sans engagement annuel</span>
      </motion.footer>
    </div>
  );
}
