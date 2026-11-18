import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export function SplashScreen() {
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

  const [phaseLabel, setPhaseLabel] = useState('Initialisation de l’atelier');

  useEffect(() => {
    if (!visible) return;

    const phaseTimer = window.setTimeout(() => {
      setPhaseLabel('Moteur typographique & PDF prêt');
    }, 950);

    const hideTimer = window.setTimeout(() => {
      setVisible(false);
    }, 1850);

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
            y: -18,
            transition: { duration: 0.45, ease: EASE_OUT },
          }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#0F172A] text-white"
        >
          {/* Subtle architectural blueprint hairlines */}
          <motion.div
            aria-hidden="true"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 0.14 }}
            transition={{ duration: 0.85, ease: EASE_OUT }}
            className="pointer-events-none absolute inset-x-0 top-1/2 h-px origin-center bg-slate-300"
          />
          <motion.div
            aria-hidden="true"
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 0.14 }}
            transition={{ duration: 0.85, ease: EASE_OUT }}
            className="pointer-events-none absolute inset-y-0 left-1/2 w-px origin-center bg-slate-300"
          />

          {/* Subtle radial focal glow behind emblem */}
          <motion.div
            aria-hidden="true"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.22 }}
            transition={{ duration: 1.1, ease: EASE_OUT }}
            className="pointer-events-none absolute h-72 w-72 rounded-full bg-[#C97B36] blur-3xl"
          />

          <div className="relative z-10 flex flex-col items-center px-6 text-center">
            {/* Animated precision vector emblem */}
            <motion.div
              initial={{ scale: 0.86, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.55, ease: EASE_OUT }}
              className="mb-5"
            >
              <svg
                width="64"
                height="64"
                viewBox="0 0 36 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <motion.rect
                  x="2"
                  y="2"
                  width="32"
                  height="32"
                  rx="7"
                  fill="#1E293B"
                  stroke="#334155"
                  strokeWidth="1"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.6, ease: EASE_OUT }}
                />
                <motion.line
                  x1="14"
                  y1="7"
                  x2="14"
                  y2="29"
                  stroke="rgba(255,255,255,0.28)"
                  strokeWidth="1"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.2, ease: EASE_OUT }}
                />
                <motion.line
                  x1="7"
                  y1="22"
                  x2="29"
                  y2="22"
                  stroke="rgba(255,255,255,0.28)"
                  strokeWidth="1"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.25, ease: EASE_OUT }}
                />
                <motion.path
                  d="M24 11H13C11.3431 11 10 12.3431 10 14V22C10 23.6569 11.3431 25 13 25H24"
                  stroke="#FFFFFF"
                  strokeWidth="2.6"
                  strokeLinecap="square"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.75, delay: 0.2, ease: EASE_OUT }}
                />
                <motion.rect
                  x="21.5"
                  y="16"
                  width="5"
                  height="5"
                  rx="1.2"
                  fill="#C97B36"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 380,
                    damping: 22,
                    delay: 0.65,
                  }}
                />
              </svg>
            </motion.div>

            {/* Staggered Wordmark & Baseline */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.35, ease: EASE_OUT }}
              className="text-3xl font-bold tracking-tight text-white"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              CharteForge
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5, ease: EASE_OUT }}
              className="mt-2 text-xs font-medium tracking-wide text-slate-300"
            >
              Identités visuelles, chartes graphiques PDF & Design Systems
            </motion.p>

            {/* Progress Hairline */}
            <div className="mt-7 w-52 space-y-2">
              <div className="h-0.5 w-full overflow-hidden rounded-full bg-slate-800">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1.55, delay: 0.15, ease: EASE_OUT }}
                  className="h-full w-full origin-left bg-[#C97B36]"
                />
              </div>
              <motion.div
                key={phaseLabel}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="font-mono text-[10px] tracking-wider text-slate-400"
              >
                {phaseLabel}
              </motion.div>
            </div>

            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              onClick={() => setVisible(false)}
              className="mt-7 rounded-md px-3 py-1 text-[11px] font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              Passer l’introduction
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
