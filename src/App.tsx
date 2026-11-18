import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, LogOut, Save } from 'lucide-react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import type { BrandBookData } from './shared/types.ts';
import {
  createDemoBrandBook,
  createEmptyBrandBook,
} from './shared/brandbook/sections.ts';
import { Step1Brand } from './components/steps/Step1Brand.tsx';
import { Step2Logo } from './components/steps/Step2Logo.tsx';
import { Step3Colors } from './components/steps/Step3Colors.tsx';
import { Step4Fonts } from './components/steps/Step4Fonts.tsx';
import { Step5ContentStyle } from './components/steps/Step5ContentStyle.tsx';
import { Step6PreviewExport } from './components/steps/Step6PreviewExport.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { BillingView } from './components/BillingView.tsx';
import { AdminView } from './components/AdminView.tsx';
import { SharedViewer } from './components/SharedViewer.tsx';
import { BrandLogo } from './components/BrandLogo.tsx';
import { SplashScreen } from './components/SplashScreen.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { AuthView } from './components/AuthView.tsx';
import { SeoHead } from './components/SeoHead.tsx';
import { resolveRouteKeyFromPath, ROUTE_SEO_META } from './shared/seoConfig.ts';

type AppTab = 'landing' | 'studio' | 'dashboard' | 'billing' | 'admin' | 'auth';

const WIZARD_STEPS = [
  { num: 1, label: 'La marque' },
  { num: 2, label: 'Le logo' },
  { num: 3, label: 'Les couleurs' },
  { num: 4, label: 'Les polices' },
  { num: 5, label: 'Contenu & style' },
  { num: 6, label: 'Aperçu & export' },
];

const LOCAL_STORAGE_KEY = 'charteforge_draft_v1';

function StudioShell() {
  const {
    profile,
    isAuthenticated,
    loading: authLoading,
    getIdToken,
    verifyEmailToken,
    refreshProfile,
    logout,
  } = useAuth();

  const [shareToken, setShareToken] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('share');
  });

  const [activeTab, setActiveTabState] = useState<AppTab>(() => {
    const key = resolveRouteKeyFromPath(window.location.pathname, false);
    if (key === 'share') return 'landing';
    return key;
  });

  const setActiveTab = (tab: AppTab, updateUrl = true) => {
    setActiveTabState(tab);
    if (updateUrl && !window.location.search) {
      const nextPath = ROUTE_SEO_META[tab]?.path || '/';
      if (window.location.pathname !== nextPath) {
        window.history.pushState({ tab }, '', nextPath);
      }
    }
  };

  useEffect(() => {
    const onPopState = () => {
      const key = resolveRouteKeyFromPath(window.location.pathname, false);
      setActiveTabState(key === 'share' ? 'landing' : key);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [verificationNotice, setVerificationNotice] = useState<{
    status: 'verifying' | 'verified' | 'error';
    message: string;
    email?: string;
  } | null>(null);
  const [billingNotice, setBillingNotice] = useState<string | null>(null);

  const [step, setStep] = useState<number>(1);
  const [stepDirection, setStepDirection] = useState<1 | -1>(1);
  const goToStep = (next: number) => {
    const clamped = Math.max(1, Math.min(6, next));
    setStepDirection(clamped >= step ? 1 : -1);
    setStep(clamped);
  };
  const [brand, setBrand] = useState<BrandBookData>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<BrandBookData>;
        if (parsed && typeof parsed === 'object' && parsed.guideline) {
          return { ...createDemoBrandBook(), ...parsed } as BrandBookData;
        }
      }
    } catch {
      // Ignore corrupt local draft
    }
    return createDemoBrandBook();
  });

  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const autoSaveTimer = useRef<number | null>(null);
  const handledUrlParams = useRef(false);

  // Switch cleanly into Studio when user logs in from AuthView or initial auth restore
  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated && activeTab === 'auth') {
      setActiveTab('studio');
    } else if (
      !isAuthenticated &&
      (activeTab === 'studio' || activeTab === 'dashboard' || activeTab === 'admin')
    ) {
      setActiveTab('landing');
    }
  }, [isAuthenticated, authLoading, activeTab]);

  // Handle Brevo email verification link & Stripe return query params
  useEffect(() => {
    if (handledUrlParams.current) return;
    const params = new URLSearchParams(window.location.search);
    const verifyToken = params.get('verify_email');
    const upgradeStatus = params.get('upgrade');
    const stripeSessionId = params.get('session_id');

    if (verifyToken) {
      handledUrlParams.current = true;
      setActiveTab('auth');
      setVerificationNotice({
        status: 'verifying',
        message: 'Validation de votre adresse e-mail en cours…',
      });
      void verifyEmailToken(verifyToken).then((res) => {
        window.history.replaceState({}, '', '/');
        if (res.ok) {
          setVerificationNotice({
            status: 'verified',
            message: 'Adresse e-mail validée. Redirection vers votre Studio…',
          });
          setActiveTab('studio');
        } else {
          setVerificationNotice({
            status: 'error',
            message: res.error || 'Lien de validation invalide ou expiré.',
            email: res.email,
          });
        }
      });
      return;
    }

    if (upgradeStatus === 'cancel') {
      handledUrlParams.current = true;
      setBillingNotice('Paiement Stripe annulé. Vous pouvez réessayer à tout moment.');
      setActiveTab('billing');
      window.history.replaceState({}, '', '/');
      return;
    }

    if (upgradeStatus === 'success') {
      if (authLoading) return;
      handledUrlParams.current = true;
      setActiveTab('billing');
      if (stripeSessionId && isAuthenticated) {
        void (async () => {
          const token = await getIdToken();
          if (!token) return;
          const res = await fetch('/api/billing/confirm', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ sessionId: stripeSessionId }),
          });
          const data = await res.json();
          window.history.replaceState({}, '', '/');
          if (res.ok) {
            await refreshProfile();
            setBillingNotice('Paiement confirmé. Votre offre Pro est désormais active.');
          } else {
            setBillingNotice(data.error || 'Confirmation Stripe en attente.');
          }
        })();
      } else {
        window.history.replaceState({}, '', '/');
        setBillingNotice('Paiement effectué. Connectez-vous pour actualiser votre offre.');
      }
    }
  }, [authLoading, isAuthenticated]);

  // Persist draft locally on every edit
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(brand));
    } catch {
      // Ignore quota exceeded
    }
  }, [brand]);

  const persistBrandToServer = async (
    targetBrand: BrandBookData,
    bumpVersion = false
  ) => {
    const token = await getIdToken();
    if (!token) return;
    setSaveState('saving');
    setSaveError(null);
    try {
      const res = await fetch('/api/brands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          brand: {
            ...targetBrand,
            status: step === 6 ? 'generated' : targetBrand.status,
            guideline: {
              ...targetBrand.guideline,
              status: step === 6 ? 'generated' : targetBrand.guideline.status,
            },
          },
          bumpVersion,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Échec de sauvegarde.');
      }
      if (data.brand) {
        setBrand(data.brand as BrandBookData);
      }
      setSaveState('saved');
    } catch (err: unknown) {
      setSaveState('error');
      setSaveError(err instanceof Error ? err.message : 'Erreur de sauvegarde.');
    }
  };

  // Debounced auto-save when authenticated and brand already exists in DB
  useEffect(() => {
    if (!isAuthenticated || !brand.id) return;
    if (autoSaveTimer.current) {
      window.clearTimeout(autoSaveTimer.current);
    }
    autoSaveTimer.current = window.setTimeout(() => {
      void persistBrandToServer(brand, false);
    }, 1800);
    return () => {
      if (autoSaveTimer.current) window.clearTimeout(autoSaveTimer.current);
    };
  }, [brand, isAuthenticated]);

  const navigateTo = (tab: AppTab) => {
    if (
      !isAuthenticated &&
      (tab === 'studio' || tab === 'dashboard' || tab === 'admin')
    ) {
      setAuthInitialMode('login');
      setActiveTab('auth');
      return;
    }
    setActiveTab(tab);
  };

  const openAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthInitialMode(mode);
    setActiveTab('auth');
  };

  const handleOpenBrand = (loaded: BrandBookData) => {
    setBrand(loaded);
    setStep(1);
    navigateTo('studio');
  };

  const handleCreateNew = () => {
    setBrand(createEmptyBrandBook());
    setStep(1);
    navigateTo('studio');
  };

  const handleLoadDemo = () => {
    setBrand(createDemoBrandBook());
    setStep(1);
    navigateTo('studio');
  };

  const handleLogout = async () => {
    await logout();
    setActiveTab('landing');
  };

  if (shareToken) {
    return (
      <>
        <SeoHead routeKey="share" />
        <div className="min-h-screen bg-surface">
          <header className="border-b border-border-hairline bg-surface-canvas">
            <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-8 px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  setShareToken(null);
                  window.history.replaceState({}, '', '/');
                }}
                className="whitespace-nowrap shrink-0"
              >
                <BrandLogo />
              </button>
              <div className="text-xs text-text-muted">Partage privé en lecture seule</div>
              <button
                type="button"
                onClick={() => {
                  setShareToken(null);
                  window.history.replaceState({}, '', '/');
                }}
                className="rounded-full bg-violet px-4 py-2 text-xs font-medium text-white whitespace-nowrap shrink-0"
              >
                Découvrir CharteForge
              </button>
            </div>
          </header>
          <main className="mx-auto max-w-[1280px] px-6 py-8">
            <SharedViewer
              token={shareToken}
              onExit={() => {
                setShareToken(null);
                window.history.replaceState({}, '', '/');
              }}
            />
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <SeoHead routeKey={activeTab} />
      <SplashScreen />
      <div className="min-h-screen bg-surface text-text-primary flex flex-col">
        {/* 3-Zone Top Bar Contract */}
        <header className="sticky top-0 z-40 border-b border-border-hairline/70 bg-surface/90 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-6 px-6">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab(isAuthenticated ? 'studio' : 'landing');
              }}
              className="whitespace-nowrap shrink-0"
              aria-label="Accueil CharteForge"
            >
              <BrandLogo />
            </a>

            <nav
              className="hidden md:flex items-center gap-7 text-sm font-medium text-text-secondary"
              aria-label="Navigation principale"
            >
              {(
                !isAuthenticated
                  ? [
                      { id: 'landing' as const, label: 'L’atelier', hash: '#atelier' },
                      { id: 'landing' as const, label: 'La méthode', hash: '#methode' },
                      { id: 'billing' as const, label: 'Les exports', hash: undefined },
                    ]
                  : [
                      { id: 'landing' as const, label: 'Accueil', hash: undefined },
                      { id: 'studio' as const, label: 'Studio', hash: undefined },
                      { id: 'dashboard' as const, label: 'Tableau de bord', hash: undefined },
                      { id: 'billing' as const, label: 'Tarifs', hash: undefined },
                      ...(profile?.role === 'admin'
                        ? [{ id: 'admin' as const, label: 'Admin', hash: undefined }]
                        : []),
                    ]
              ).map((item) => {
                const isActive = activeTab === item.id && !item.hash;
                return (
                  <button
                    key={`${item.id}-${item.label}`}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      if (item.hash) {
                        window.setTimeout(() => {
                          document.querySelector(item.hash!)?.scrollIntoView({ behavior: 'smooth' });
                        }, 80);
                      }
                    }}
                    className={`relative py-1 transition-colors hover:text-text-primary whitespace-nowrap shrink-0 ${
                      isActive ? 'text-text-primary font-semibold' : ''
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <motion.span
                        layoutId="top-nav-underline"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                        className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-violet"
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center gap-2.5 shrink-0">
              {isAuthenticated ? (
                <div className="flex items-center gap-2.5">
                  <span className="hidden sm:inline text-xs text-text-secondary whitespace-nowrap">
                    {profile?.email}
                  </span>
                  <button
                    type="button"
                    onClick={() => void handleLogout()}
                    title="Déconnexion"
                    className="rounded-full border border-border-hairline p-2.5 text-text-secondary hover:bg-surface-subtle min-h-11 min-w-11 inline-flex items-center justify-center"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateNew}
                    className="inline-flex min-h-11 items-center rounded-full bg-ink px-4 py-2 text-xs font-semibold text-on-primary hover:bg-[#2a2a42] whitespace-nowrap shrink-0"
                  >
                    Nouvelle charte
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openAuth('login')}
                    className="hidden rounded-full px-3 py-2 text-xs font-semibold text-text-secondary transition-colors hover:text-text-primary sm:inline-flex whitespace-nowrap shrink-0"
                  >
                    Connexion
                  </button>
                  <button
                    type="button"
                    onClick={() => openAuth('register')}
                    className="inline-flex min-h-11 items-center rounded-full bg-ink px-4 py-2.5 text-xs font-semibold text-on-primary shadow-sm transition-all hover:bg-[#2a2a42] whitespace-nowrap shrink-0"
                  >
                    Créer ma charte
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main
          className={`mx-auto w-full flex-1 ${
            activeTab === 'landing'
              ? 'max-w-none px-0 py-0'
              : 'max-w-[1200px] px-6 py-8'
          }`}
        >
          <AnimatePresence mode="wait">
            {activeTab === 'landing' && (
              <motion.div
                key="page-landing"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <LandingPage
                  onStartAuth={(mode) => {
                    if (isAuthenticated) {
                      setActiveTab('studio');
                    } else {
                      openAuth(mode ?? 'register');
                    }
                  }}
                  onViewPricing={() => setActiveTab('billing')}
                />
              </motion.div>
            )}

            {activeTab === 'auth' && !isAuthenticated && (
              <motion.div
                key="page-auth"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <AuthView
                  initialMode={authInitialMode}
                  onSuccess={() => setActiveTab('studio')}
                  onGoToPricing={() => setActiveTab('billing')}
                  verificationNotice={verificationNotice}
                />
              </motion.div>
            )}

            {activeTab === 'billing' && (
              <motion.div
                key="page-billing"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <BillingView
                  onRequestAuth={() => openAuth('login')}
                  externalNotice={billingNotice}
                />
              </motion.div>
            )}

            {activeTab === 'studio' && isAuthenticated && (
              <motion.div
                key="page-studio"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-6"
              >
                {/* Wizard Stepper + Save Status */}
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-full border border-border-hairline bg-surface-canvas px-4 py-3">
                  <div className="flex flex-wrap items-center gap-1">
                    {WIZARD_STEPS.map((s) => (
                      <button
                        key={s.num}
                        type="button"
                        onClick={() => goToStep(s.num)}
                        className={`relative rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                          step === s.num
                            ? 'text-white'
                            : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary'
                        }`}
                      >
                        {step === s.num && (
                          <motion.span
                            layoutId="wizard-step-pill"
                            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                            className="absolute inset-0 rounded-full bg-violet"
                          />
                        )}
                        <span className="relative z-10">
                          <span className="mr-1.5 font-mono opacity-75">0{s.num}</span>
                          {s.label}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-text-muted whitespace-nowrap">
                      {saveState === 'saving'
                        ? 'Enregistrement…'
                        : saveState === 'saved'
                          ? 'Sauvegardé en base'
                          : 'Brouillon prêt'}
                    </span>
                    <button
                      type="button"
                      onClick={() => void persistBrandToServer(brand, false)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border-hairline bg-surface-canvas px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-surface-subtle whitespace-nowrap shrink-0"
                    >
                      <Save className="h-3.5 w-3.5" />
                      Enregistrer
                    </button>
                  </div>
                </div>

                {saveError && (
                  <div className="flex items-center justify-between rounded-full border border-wcag-warning/40 bg-wcag-warning-subtle px-4 py-3 text-xs text-wcag-warning">
                    <span>{saveError}</span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('billing')}
                      className="font-semibold underline"
                    >
                      Voir les offres
                    </button>
                  </div>
                )}

                {/* Directional Step Content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: stepDirection * 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: stepDirection * -18 }}
                    transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {step === 1 && (
                      <Step1Brand
                        brand={brand}
                        onChange={setBrand}
                        onLoadDemo={handleLoadDemo}
                      />
                    )}
                    {step === 2 && <Step2Logo brand={brand} onChange={setBrand} />}
                    {step === 3 && <Step3Colors brand={brand} onChange={setBrand} />}
                    {step === 4 && <Step4Fonts brand={brand} onChange={setBrand} />}
                    {step === 5 && (
                      <Step5ContentStyle brand={brand} onChange={setBrand} />
                    )}
                    {step === 6 && (
                      <Step6PreviewExport
                        brand={brand}
                        onSaveVersion={(bump) => persistBrandToServer(brand, bump)}
                        saving={saveState === 'saving'}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Bottom Step Navigation */}
                <div className="flex items-center justify-between border-t border-border-hairline pt-5">
                  <button
                    type="button"
                    disabled={step === 1}
                    onClick={() => goToStep(step - 1)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border-hairline bg-surface-canvas px-4 py-2 text-xs font-medium text-text-secondary hover:bg-surface-subtle disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Étape précédente
                  </button>
                  {step < 6 && (
                    <button
                      type="button"
                      onClick={() => goToStep(step + 1)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-violet px-4 py-2 text-xs font-medium text-white hover:bg-ink"
                    >
                      Étape suivante
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'dashboard' && isAuthenticated && (
              <motion.div
                key="page-dashboard"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <DashboardView
                  onOpenBrand={handleOpenBrand}
                  onCreateNew={handleCreateNew}
                  onImportDemo={handleLoadDemo}
                  onGoToBilling={() => setActiveTab('billing')}
                />
              </motion.div>
            )}

            {activeTab === 'admin' && isAuthenticated && profile?.role === 'admin' && (
              <motion.div
                key="page-admin"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <AdminView />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="border-t border-border-hairline bg-surface-canvas">
          <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-6 py-5 text-xs text-text-muted">
            <span>© 2026 CharteForge · Studio de marque propulsé par l’IA</span>
            <div className="flex items-center gap-4">
              <a href="/demo-charte-aurelia.pdf" download className="hover:text-text-primary">
                Exemple PDF (Aurelia Atelier)
              </a>
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab('landing');
                }}
                className="hover:text-text-primary"
              >
                Accueil
              </a>
              <a
                href="/tarifs"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab('billing');
                }}
                className="hover:text-text-primary"
              >
                Tarifs
              </a>
              <a href="/llms.txt" className="hover:text-text-primary">
                LLMs.txt
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AuthProvider>
        <StudioShell />
      </AuthProvider>
    </MotionConfig>
  );
}
