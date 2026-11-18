import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { BrandLogo } from './BrandLogo.tsx';

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export function SplashScreen() {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState<boolean>(() => {
    try {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return false;
      }
      const params = new URLSearchParams(window.location.search);
      if (params.has('verify_email') || params.has('upgrade') || params.has('share')) {
        return false;
      }
      return true;
    } catch {
      return true;
    }
  });

  const [phaseLabel, setPhaseLabel] = useState('Préparation de votre atelier…');

  useEffect(() => {
    if (!visible) return;

    const phaseTimer = window.setTimeout(() => {
      setPhaseLabel('Identité, typo & tokens prêts');
    }, 900);

    const hideTimer = window.setTimeout(() => {
      setVisible(false);
    }, 1800);

    return () => {
      window.clearTimeout(phaseTimer);
      window.clearTimeout(hideTimer);
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="charteforge-splash"
          role="status"
          aria-label="Chargement de CharteForge"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            y: reduceMotion ? 0 : -12,
            transition: { duration: 0.4, ease: EASE_OUT },
          }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-surface text-text-primary"
        >
          {/* Soft ambient blobs — même esprit que le CTA landing */}
          <motion.div
            aria-hidden
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 0.55, scale: 1 }}
            transition={{ duration: 1, ease: EASE_OUT }}
            className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-violet/15 blur-3xl"
          />
          <motion.div
            aria-hidden
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 0.4, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.1, ease: EASE_OUT }}
            className="pointer-events-none absolute -right-16 bottom-20 h-80 w-80 rounded-full bg-coral/15 blur-3xl"
          />
          <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            transition={{ duration: 1.2, ease: EASE_OUT }}
            className="pointer-events-none absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-gold/20 blur-3xl"
          />

          <div className="relative z-10 flex max-w-sm flex-col items-center px-6 text-center">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EASE_OUT }}
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-violet-soft px-3 py-1.5 text-[13px] font-semibold text-violet"
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Studio de marque propulsé par l’IA
            </motion.div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55, delay: 0.08, ease: EASE_OUT }}
              className="mb-5 rounded-[1.75rem] border border-border-hairline bg-surface-canvas p-6 shadow-micro"
            >
              <img
                src="/logo-mark.png"
                alt=""
                width={120}
                height={52}
                className="mx-auto h-12 w-auto object-contain"
                decoding="async"
              />
            </motion.div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.18, ease: EASE_OUT }}
            >
              <BrandLogo size="lg" />
            </motion.div>

            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.28, ease: EASE_OUT }}
              className="mt-3 max-w-[28ch] text-[15px] leading-relaxed text-text-secondary"
            >
              Une identité qui vous ressemble,{' '}
              <span className="relative inline-block font-semibold text-violet">
                enfin.
                <svg
                  className="absolute -bottom-1 left-0 w-full"
                  viewBox="0 0 80 8"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M2 5c18-4 36 2 52-1 10-2 18-2 24 0"
                    stroke="#FF7A59"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </motion.p>

            <div className="mt-8 w-56 space-y-2.5">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1.45, delay: 0.12, ease: EASE_OUT }}
                  className="h-full w-full origin-left rounded-full bg-gradient-to-r from-violet via-[#7B72F8] to-coral"
                />
              </div>
              <motion.div
                key={phaseLabel}
                initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="text-xs font-medium text-text-muted"
              >
                {phaseLabel}
              </motion.div>
            </div>

            <motion.button
              type="button"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              onClick={() => setVisible(false)}
              className="mt-7 min-h-11 rounded-full px-4 py-2 text-xs font-semibold text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
            >
              Passer l’introduction
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
