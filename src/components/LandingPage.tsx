import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  Check,
  MoreHorizontal,
  Send,
  Sparkles,
  Star,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { Badge } from './ui/Badge.tsx';
import { Button } from './ui/Button.tsx';
import { Card } from './ui/Card.tsx';
import { BrandLogo } from './BrandLogo.tsx';
import { cn } from '../lib/cn.ts';

interface LandingPageProps {
  onStartAuth: (mode?: 'login' | 'register') => void;
  onViewPricing: () => void;
}

const MOODS = ['Chaleureux & humain', 'Audacieux & coloré', 'Minimal & premium'] as const;

const METHOD_STEPS = [
  {
    id: '01',
    title: 'Poser votre intention',
    body: 'On clarifie votre activité, votre audience et ce qui rend votre marque vraiment singulière.',
  },
  {
    id: '02',
    title: 'Choisir une direction',
    body: 'Trois univers esthétiques pour cadrer le ton, sans vous perdre dans mille options.',
  },
  {
    id: '03',
    title: 'Façonner votre identité',
    body: 'Logo, palette, typographies et éléments graphiques se construisent ensemble, en dialogue.',
  },
  {
    id: '04',
    title: 'Vérifier la cohérence',
    body: 'Chaque association texte/fond et chaque usage est contrôlé pour rester lisible et fiable.',
  },
  {
    id: '05',
    title: 'Exporter et partager',
    body: 'PDF, tokens et assets prêts à livrer — sans jargon ni fichiers mystérieux.',
  },
];

const PALETTE = [
  { hex: '#6257F6', label: 'Principal' },
  { hex: '#FF7A59', label: 'Accent' },
  { hex: '#FFD66B', label: 'Secondaire' },
  { hex: '#F5F1FF', label: 'Fond' },
] as const;

export function LandingPage({ onStartAuth, onViewPricing }: LandingPageProps) {
  const reduceMotion = useReducedMotion();
  const [mood, setMood] = useState<(typeof MOODS)[number]>('Chaleureux & humain');
  const [chatDraft, setChatDraft] = useState('');
  const [openStep, setOpenStep] = useState(0);
  const [logoVariant, setLogoVariant] = useState<'logotype' | 'mono' | 'symbole'>('logotype');

  const fade = reduceMotion
    ? {}
    : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="relative -mx-6 -mt-8 w-[calc(100%+3rem)] bg-surface">
      {/* Hero */}
      <section className="mx-auto flex max-w-[920px] flex-col items-center px-6 pb-16 pt-10 text-center md:pt-14">
        <motion.div {...fade} transition={{ duration: 0.4 }}>
          <Badge tone="violet" className="gap-2 px-3 py-1.5 text-[13px] font-semibold">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Votre studio de marque, propulsé par l’IA
          </Badge>
        </motion.div>

        <motion.h1
          {...fade}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mt-7 max-w-[18ch] text-[clamp(2.5rem,6vw,4.25rem)] font-extrabold leading-[1.05] tracking-[-0.04em] text-text-primary"
        >
          Une identité qui vous ressemble,{' '}
          <span className="relative inline-block text-violet">
            enfin.
            <svg
              className="absolute -bottom-2 left-0 w-full"
              viewBox="0 0 120 10"
              fill="none"
              aria-hidden
            >
              <path
                d="M2 7c28-6 55 2 78-2 14-2 28-3 38 0"
                stroke="#FF7A59"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </motion.h1>

        <motion.p
          {...fade}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6 max-w-xl text-base leading-relaxed text-text-secondary md:text-lg"
        >
          Discutez, explorez, ajustez. CharteForge transforme votre vision en un univers de marque
          complet, cohérent et prêt à rayonner.
        </motion.p>

        <motion.div
          {...fade}
          transition={{ duration: 0.45, delay: 0.16 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Button size="lg" onClick={() => onStartAuth('register')}>
            Commencer à créer
            <ArrowRight className="h-4 w-4" />
          </Button>
          <a
            href="#methode"
            className="inline-flex min-h-11 items-center gap-1 px-2 text-sm font-semibold text-text-primary underline-offset-4 hover:underline"
          >
            Découvrir la méthode
            <ArrowDown className="h-4 w-4" />
          </a>
        </motion.div>

        <motion.div
          {...fade}
          transition={{ duration: 0.45, delay: 0.22 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm text-text-secondary"
        >
          <div className="flex -space-x-2" aria-hidden>
            {['#6559F5', '#FF7A59', '#FFD66B'].map((c) => (
              <span
                key={c}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface text-[10px] font-bold text-white"
                style={{ backgroundColor: c }}
              >
                {c === '#6559F5' ? 'AL' : c === '#FF7A59' ? 'MG' : 'JL'}
              </span>
            ))}
          </div>
          <span className="inline-flex items-center gap-1 font-semibold text-text-primary">
            <Star className="h-4 w-4 fill-gold text-gold" aria-hidden />
            4,9/5
          </span>
          <span>par plus de 600 créateurs</span>
        </motion.div>
      </section>

      {/* Atelier */}
      <section id="atelier" className="scroll-mt-24 bg-surface-subtle py-16 md:py-20">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] font-extrabold tracking-[-0.03em] text-text-primary">
              De vos mots à votre univers.
            </h2>
            <p className="mt-3 text-base text-text-secondary">
              Votre intuition donne le cap. Notre IA vous aide à rendre chaque choix plus simple,
              plus clair et plus juste.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Chat */}
            <Card className="flex flex-col gap-4 p-5 lg:col-span-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    {!reduceMotion && (
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-wcag-pass opacity-60" />
                    )}
                    <span className="relative h-2.5 w-2.5 rounded-full bg-wcag-pass" />
                  </span>
                  <span className="text-sm font-semibold">Assistant CharteForge</span>
                  <span className="text-xs text-text-muted">En ligne</span>
                </div>
                <button
                  type="button"
                  className="rounded-full p-2 text-text-muted hover:bg-surface-muted"
                  aria-label="Options"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>

              <div className="rounded-2xl bg-surface-lavender/70 p-4 text-sm leading-relaxed text-text-primary">
                Bonjour ! Je suis là pour donner forme à votre marque. Pour commencer, racontez-moi
                simplement votre projet.
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold text-text-muted">
                  Quel univers vous attire le plus ?
                </p>
                <div className="flex flex-wrap gap-2">
                  {MOODS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMood(m)}
                      className={cn(
                        'rounded-full border px-3 py-2 text-xs font-semibold transition-colors min-h-11',
                        mood === m
                          ? 'border-violet bg-violet-soft text-violet'
                          : 'border-border-hairline bg-surface-canvas text-text-secondary hover:bg-surface-muted',
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <form
                className="mt-auto flex items-center gap-2 rounded-full border border-border-hairline bg-surface-canvas p-1.5"
                onSubmit={(e) => {
                  e.preventDefault();
                  setChatDraft('');
                  onStartAuth('register');
                }}
              >
                <label className="sr-only" htmlFor="chat-draft">
                  Décrivez votre marque
                </label>
                <input
                  id="chat-draft"
                  value={chatDraft}
                  onChange={(e) => setChatDraft(e.target.value)}
                  placeholder="Décrivez votre marque ou vos envies…"
                  className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-text-muted"
                />
                <Button type="submit" size="sm" className="shrink-0 px-3" aria-label="Envoyer">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </Card>

            {/* Preview Soléa */}
            <Card className="flex flex-col gap-5 p-5 lg:col-span-7">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-bold">Soléa Studio</div>
                  <div className="text-xs text-text-muted">Sauvegardé à l’instant</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onStartAuth('register')}>
                    Exporter
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onStartAuth('register')}>
                    Générer d’autres pistes
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-bold">Logo & symbole</h3>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      ['logotype', 'soléa', 'Logotype'],
                      ['mono', 'S ✦', 'Monogramme'],
                      ['symbole', '◉', 'Symbole'],
                    ] as const
                  ).map(([key, mark, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setLogoVariant(key)}
                      className={cn(
                        'flex min-h-[88px] flex-col items-center justify-center gap-1 rounded-2xl border p-3 transition-colors',
                        logoVariant === key
                          ? 'border-violet bg-violet-soft'
                          : 'border-border-hairline bg-surface-subtle',
                      )}
                    >
                      <span
                        className={cn(
                          'text-lg font-bold',
                          key === 'logotype' && 'font-outfit lowercase tracking-tight',
                        )}
                      >
                        {mark}
                      </span>
                      <span className="text-[11px] text-text-muted">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-bold">Palette de couleurs</h3>
                <div className="mb-2 flex flex-wrap gap-2">
                  {['Énergie douce', 'Nature urbaine', 'Éditorial chic'].map((p, i) => (
                    <span
                      key={p}
                      className={cn(
                        'rounded-full px-2.5 py-1 text-[11px] font-semibold',
                        i === 0 ? 'bg-violet-soft text-violet' : 'bg-surface-muted text-text-secondary',
                      )}
                    >
                      {p}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {PALETTE.map((c) => (
                    <div
                      key={c.hex}
                      className="overflow-hidden rounded-2xl border border-border-hairline"
                    >
                      <div className="h-14" style={{ backgroundColor: c.hex }} />
                      <div className="bg-surface-canvas px-2 py-1.5">
                        <div className="font-mono text-[11px] font-semibold">{c.hex}</div>
                        <div className="text-[10px] text-text-muted">{c.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-1 text-sm font-bold">Typographies</h3>
                <p className="mb-2 text-xs text-text-muted">Des duos faits pour s’entendre</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {[
                    { sample: 'Ag', name: 'Outfit', vibe: 'Moderne & amicale', cls: 'font-outfit' },
                    {
                      sample: 'Ag',
                      name: 'DM Serif Display',
                      vibe: 'Élégante & éditoriale',
                      cls: 'font-dm-serif',
                    },
                    {
                      sample: 'Ag',
                      name: 'Space Grotesk',
                      vibe: 'Créative & affirmée',
                      cls: 'font-space-grotesk',
                    },
                  ].map((f) => (
                    <div
                      key={f.name}
                      className="rounded-2xl border border-border-hairline bg-surface-subtle p-3"
                    >
                      <div className={cn('text-2xl font-semibold', f.cls)}>{f.sample}</div>
                      <div className="mt-1 text-xs font-bold">{f.name}</div>
                      <div className="text-[11px] text-text-muted">{f.vibe}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-ink p-5 text-on-primary">
                <div className="font-mono text-[11px] text-text-muted">04</div>
                <h4 className="mt-1 font-dm-serif text-xl">Des idées qui font du bien.</h4>
                <p className="mt-2 text-sm text-on-tertiary-container">
                  Créer mieux, vivre doucement et remettre du sens dans le quotidien.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Méthode */}
      <section id="methode" className="scroll-mt-24 py-16 md:py-20">
        <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-10 px-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="text-[clamp(1.75rem,3vw,2.35rem)] font-extrabold tracking-[-0.03em] text-text-primary">
              Vous gardez la vision. On vous guide pour le reste.
            </h2>
            <p className="mt-4 text-base text-text-secondary">
              Pas besoin d’avoir fait une école de design. Chaque étape est expliquée avec des mots
              simples pour vous aider à choisir en confiance.
            </p>
            <p className="mt-4 rounded-2xl bg-violet-soft/70 p-4 text-sm text-text-primary">
              Le petit guide est toujours là. Retrouvez nos conseils directement dans votre atelier,
              au bon moment.
            </p>
          </div>
          <div className="flex flex-col gap-2 lg:col-span-7">
            {METHOD_STEPS.map((step, index) => {
              const open = openStep === index;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setOpenStep(open ? -1 : index)}
                  className={cn(
                    'rounded-[1.25rem] border p-4 text-left transition-colors',
                    open
                      ? 'border-violet bg-surface-canvas shadow-micro'
                      : 'border-border-hairline bg-surface-subtle hover:bg-surface-canvas',
                  )}
                  aria-expanded={open}
                >
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-sm font-bold text-violet">{step.id}</span>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-text-primary">{step.title}</div>
                      {open && (
                        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                          {step.body}
                        </p>
                      )}
                    </div>
                    {open && <Check className="mt-0.5 h-4 w-4 shrink-0 text-violet" aria-hidden />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Exports CTA */}
      <section id="exports" className="scroll-mt-24 bg-surface-subtle py-16 md:py-20">
        <div className="mx-auto flex max-w-[1100px] flex-col items-center gap-10 px-6 lg:flex-row lg:items-stretch lg:justify-between">
          <div className="max-w-lg text-center lg:text-left">
            <h2 className="text-[clamp(1.75rem,3vw,2.35rem)] font-extrabold tracking-[-0.03em]">
              Votre marque est prête à prendre vie.
            </h2>
            <p className="mt-3 text-base text-text-secondary">
              Un kit complet pour créer, partager et rester cohérent partout. Sans fichiers
              mystérieux, sans jargon.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-text-secondary">
              <li className="flex items-center justify-center gap-2 lg:justify-start">
                <Check className="h-4 w-4 text-violet" /> Palette HEX · RGB · CMJN
              </li>
              <li className="flex items-center justify-center gap-2 lg:justify-start">
                <Check className="h-4 w-4 text-violet" /> Typographies, liens & licences
              </li>
              <li className="flex items-center justify-center gap-2 lg:justify-start">
                <Check className="h-4 w-4 text-violet" /> PDF brand book + tokens CSS
              </li>
            </ul>
            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Button size="lg" onClick={() => onStartAuth('register')}>
                Exporter mon kit de marque
              </Button>
              <Button variant="outline" size="lg" onClick={onViewPricing}>
                Voir les tarifs
              </Button>
            </div>
          </div>

          <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] bg-gradient-to-br from-violet via-[#7B72F8] to-[#FF7A59] p-6 text-white shadow-overlay">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
            <div className="absolute -bottom-8 left-8 h-32 w-32 rounded-full bg-[#FFD66B]/30 blur-2xl" />
            <div className="relative z-10">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80">
                Charte de marque
              </div>
              <h3 className="mt-3 text-2xl font-extrabold">Soléa Studio</h3>
              <p className="mt-1 text-sm text-white/85">Votre guide complet</p>
              <div className="mt-4 flex gap-2">
                <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold">
                  PDF
                </span>
                <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold">
                  24 pages
                </span>
              </div>
              <p className="mt-8 text-sm text-white/80">Votre identité, forgée avec intention.</p>
              <a
                href="/demo-charte-aurelia.pdf"
                download
                className="mt-4 inline-flex min-h-11 items-center rounded-full bg-white px-4 py-2 text-sm font-bold text-ink hover:bg-surface-subtle"
              >
                Télécharger l’exemple
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Mini footer landing */}
      <footer className="border-t border-border-hairline bg-surface-canvas py-10">
        <div className="mx-auto flex max-w-[1100px] flex-col items-center justify-between gap-4 px-6 text-center sm:flex-row sm:text-left">
          <div className="flex flex-col items-center gap-1 sm:items-start">
            <BrandLogo size="sm" />
            <div className="text-xs text-text-muted">© 2026 CharteForge</div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-text-secondary">
            <a href="#atelier" className="hover:text-text-primary">
              Atelier
            </a>
            <a href="#methode" className="hover:text-text-primary">
              Méthode
            </a>
            <button type="button" onClick={onViewPricing} className="hover:text-text-primary">
              Tarifs
            </button>
            <a href="/llms.txt" className="hover:text-text-primary">
              Confidentialité
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
