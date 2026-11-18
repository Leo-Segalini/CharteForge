import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext.tsx';

interface BillingViewProps {
  onRequestAuth?: () => void;
  externalNotice?: string | null;
}

export function BillingView({ onRequestAuth, externalNotice }: BillingViewProps) {
  const { isAuthenticated, profile, getIdToken, loginWithGoogle, refreshProfile } =
    useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const isPro = profile?.plan === 'pro' || profile?.role === 'admin';
  const displayedMessage = message ?? externalNotice ?? null;

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
    await fetch('/api/billing/downgrade', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    await refreshProfile();
    setMessage('Compte repassé sur l’offre Gratuite.');
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-xl font-semibold text-slate-900">
          Offres & Facturation
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Démarrez gratuitement pour tester le générateur ou passez à l’offre Pro pour livrer des dossiers clients sans filigrane.
        </p>
      </div>

      {displayedMessage && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800"
        >
          {displayedMessage}
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -2 }}
          className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-6"
        >
          <div>
            <div className="text-xs font-medium text-slate-500">Pour découvrir</div>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">Offre Gratuite</h3>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-mono text-3xl font-bold text-slate-900 tabular-nums">
                0 €
              </span>
              <span className="text-xs text-slate-500">/ mois</span>
            </div>
            <ul className="mt-6 space-y-2.5 text-sm text-slate-700">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-slate-500" />1 charte graphique enregistrée
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-slate-500" />
                Génération PDF avec filigrane discret
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-slate-500" />
                Aperçu complet des 18 sections & contrôle WCAG
              </li>
            </ul>
          </div>
          <div className="mt-8">
            {isPro && isAuthenticated ? (
              <button
                type="button"
                disabled={loading}
                onClick={() => void handleDowngrade()}
                className="w-full rounded-lg border border-slate-200 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Revenir à l’offre Gratuite
              </button>
            ) : (
              <div className="rounded-lg border border-slate-200 bg-slate-50 py-2.5 text-center text-xs font-medium text-slate-600">
                {isAuthenticated ? 'Offre actuelle' : 'Inclus dès l’inscription gratuite'}
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -2 }}
          className="flex flex-col justify-between rounded-lg border border-slate-900 bg-white p-6"
        >
          <div>
            <div className="text-xs font-medium text-slate-500">
              Pour studios & agences
            </div>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">Offre Pro</h3>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-mono text-3xl font-bold text-slate-900 tabular-nums">
                5 €
              </span>
              <span className="text-xs text-slate-500">/ mois</span>
            </div>
            <ul className="mt-6 space-y-2.5 text-sm text-slate-700">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-slate-900" />
                Chartes graphiques & versions illimitées
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-slate-900" />
                Export PDF haute fidélité sans filigrane
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-slate-900" />
                Pack ZIP complet (tokens.css, Tailwind, JSON, logos, WOFF2)
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-slate-900" />
                Liens de partage privés avec expiration
              </li>
            </ul>
          </div>
          <div className="mt-8">
            {isPro ? (
              <div className="rounded-lg bg-slate-900 py-2.5 text-center text-xs font-medium text-white">
                Abonnement Pro actif
              </div>
            ) : (
              <motion.button
                type="button"
                whileTap={{ scale: 0.99 }}
                disabled={loading}
                onClick={() => void handleCheckout()}
                className="w-full rounded-lg bg-slate-900 py-2.5 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {loading
                  ? 'Redirection Stripe en cours…'
                  : isAuthenticated
                    ? 'Passer à l’offre Pro (Stripe)'
                    : 'Se connecter et activer Pro'}
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
