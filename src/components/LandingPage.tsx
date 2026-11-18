import React from 'react';
import {
  ArrowRight,
  Check,
  Download,
  FileText,
  Layers,
  Palette,
  ShieldCheck,
  Type,
} from 'lucide-react';
import { motion } from 'motion/react';
import { FAQ_ITEMS } from '../shared/seoConfig.ts';

interface LandingPageProps {
  onStartAuth: (mode?: 'login' | 'register') => void;
  onViewPricing: () => void;
}

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const WORKFLOW_STEPS = [
  {
    num: '01',
    title: 'Analyse vectorielle & déclinaisons du logo',
    desc: 'Importez votre SVG, PNG ou WebP. CharteForge assainit les tracés, vérifie la résolution et génère automatiquement les versions monochrome noir, négative blanc, sans baseline et monogramme recadré.',
  },
  {
    num: '02',
    title: 'Palette structurée, CMJN & conformité WCAG 2.1',
    desc: 'Attribuez un rôle précis à chaque couleur (primaire, surface, texte, succès, erreur). Obtenez les échelles 100–900, les valeurs RGB/HSL/CMJN et la matrice d’associations texte/fond conformes AA et AAA.',
  },
  {
    num: '03',
    title: 'Typographie réelle & échelles modulaires',
    desc: 'Importez vos fichiers TTF, OTF ou WOFF2 (ou sélectionnez Google Fonts). La plateforme convertit en WOFF2, inspecte les glyphes français et embarque les fontes natives dans le PDF.',
  },
  {
    num: '04',
    title: 'Brand book A4 en PDF & pack Design Tokens',
    desc: 'Compilez jusqu’à 18 chapitres paginés en A4 paysage ou portrait via rendu Chromium, accompagnés des fichiers tokens.css, tailwind.config.js, brand.json et d’un lien de partage privé.',
  },
];

export function LandingPage({ onStartAuth, onViewPricing }: LandingPageProps) {
  return (
    <div className="space-y-20 py-4">
      {/* 1. Hero Section */}
      <section className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE_OUT }}
            className="text-xs font-semibold uppercase tracking-widest text-[#C97B36]"
          >
            Atelier automatisé d’identité visuelle
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08, ease: EASE_OUT }}
            className="font-bold tracking-tight text-slate-900"
            style={{ fontSize: 'clamp(2.25rem, 3.8vw, 3.35rem)', lineHeight: 1.08 }}
          >
            Produisez des chartes graphiques d’agence en PDF et Design Tokens.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16, ease: EASE_OUT }}
            className="max-w-xl text-base leading-relaxed text-slate-600"
          >
            Importez votre logo, vos polices et vos couleurs. CharteForge calcule les zones d’exclusion, les variantes monochromes, la matrice d’accessibilité WCAG et met en page un brand book complet prêt à livrer à vos clients ou équipes produit.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.24, ease: EASE_OUT }}
            className="flex flex-wrap items-center gap-3 pt-2"
          >
            <motion.button
              type="button"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onStartAuth('register')}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 whitespace-nowrap"
            >
              Créer ma charte graphique
              <ArrowRight className="h-4 w-4" />
            </motion.button>
            <motion.a
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              href="/demo-charte-aurelia.pdf"
              download
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50 whitespace-nowrap"
            >
              <Download className="h-4 w-4 text-slate-500" />
              Télécharger un exemple PDF
            </motion.a>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.34 }}
            className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-500"
          >
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-slate-900" />
              18 chapitres configurables (FR / EN)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-slate-900" />
              Export CSS, Tailwind & JSON
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-slate-900" />
              Accès gratuit immédiat
            </span>
          </motion.div>
        </div>

        {/* Agency Brand Book Specimen Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, delay: 0.18, ease: EASE_OUT }}
          className="lg:col-span-6"
        >
          <div className="rounded-xl border border-slate-200 bg-white p-5 transition-shadow duration-300 hover:shadow-sm">
            <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3 text-xs text-slate-500">
              <span className="font-mono font-semibold text-slate-900">
                04 / LOGOTYPE & ZONE D’EXCLUSION
              </span>
              <span className="font-mono">A4 PAYSAGE · 300 DPI</span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Clear-space architectural diagram */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.32, ease: EASE_OUT }}
                className="flex flex-col justify-between rounded-lg border border-slate-200 bg-[#F8F9FB] p-4"
              >
                <div className="text-[11px] font-medium text-slate-500">
                  Zone de protection (2X)
                </div>
                <div className="my-4 flex items-center justify-center">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                    className="relative border border-dashed border-[#C97B36] bg-white px-7 py-5"
                  >
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#F8F9FB] px-1 font-mono text-[10px] font-semibold text-[#C97B36]">
                      2X
                    </span>
                    <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-[#F8F9FB] px-1 font-mono text-[10px] font-semibold text-[#C97B36]">
                      2X
                    </span>
                    <span className="absolute -left-3 top-1/2 -translate-y-1/2 bg-[#F8F9FB] px-0.5 font-mono text-[10px] font-semibold text-[#C97B36]">
                      2X
                    </span>
                    <span className="absolute -right-3 top-1/2 -translate-y-1/2 bg-[#F8F9FB] px-0.5 font-mono text-[10px] font-semibold text-[#C97B36]">
                      2X
                    </span>
                    <div className="border border-slate-200 px-3 py-2 text-sm font-bold tracking-tight text-slate-900">
                      AURELIA
                    </div>
                  </motion.div>
                </div>
                <div className="flex items-center justify-between font-mono text-[10px] text-slate-500 tabular-nums">
                  <span>Min. print : 24 mm</span>
                  <span>Web : 96 px</span>
                </div>
              </motion.div>

              {/* Colorway A / B / C & Forbidden check */}
              <div className="grid grid-cols-2 gap-2.5">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.36, ease: EASE_OUT }}
                  whileHover={{ y: -2 }}
                  className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-3"
                >
                  <span className="font-mono text-[10px] text-slate-400">A · Principal</span>
                  <div className="my-2 text-center text-xs font-bold tracking-tight text-[#182B49]">
                    AURELIA
                  </div>
                  <span className="text-[10px] text-emerald-700">Fond clair</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.42, ease: EASE_OUT }}
                  whileHover={{ y: -2 }}
                  className="flex flex-col justify-between rounded-lg border border-slate-900 bg-[#182B49] p-3 text-white"
                >
                  <span className="font-mono text-[10px] text-slate-300">B · Négatif</span>
                  <div className="my-2 text-center text-xs font-bold tracking-tight text-white">
                    AURELIA
                  </div>
                  <span className="text-[10px] text-slate-200">Fond primaire</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.48, ease: EASE_OUT }}
                  whileHover={{ y: -2 }}
                  className="flex flex-col justify-between rounded-lg border border-slate-200 bg-slate-100 p-3"
                >
                  <span className="font-mono text-[10px] text-slate-500">C · Mono N&B</span>
                  <div className="my-2 text-center text-xs font-bold tracking-tight text-slate-900">
                    AURELIA
                  </div>
                  <span className="text-[10px] text-slate-600">Impression</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.54, ease: EASE_OUT }}
                  whileHover={{ y: -2 }}
                  className="relative flex flex-col justify-between overflow-hidden rounded-lg border border-red-200 bg-[#C97B36] p-3 text-white"
                >
                  <span className="font-mono text-[10px] text-white/90">Interdit</span>
                  <div className="my-2 text-center text-xs font-bold tracking-tight text-white/40">
                    AURELIA
                  </div>
                  <span className="text-[10px] font-medium text-white">Contraste &lt; 3:1</span>
                  <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    className="pointer-events-none absolute inset-0 h-full w-full opacity-75"
                  >
                    <line x1="8" y1="8" x2="92" y2="92" stroke="#DC2626" strokeWidth="3" />
                    <line x1="92" y1="8" x2="8" y2="92" stroke="#DC2626" strokeWidth="3" />
                  </svg>
                </motion.div>
              </div>
            </div>

            {/* Palette & Token footer bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45, delay: 0.55 }}
              className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-200 pt-4 sm:grid-cols-3"
            >
              <div className="flex items-center gap-2.5">
                <span className="h-7 w-7 rounded border border-slate-200 bg-[#182B49]" />
                <div className="font-mono text-[11px]">
                  <div className="font-semibold text-slate-900">#182B49</div>
                  <div className="text-slate-500">CMJN 67/41/0/71</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="h-7 w-7 rounded border border-slate-200 bg-[#C97B36]" />
                <div className="font-mono text-[11px]">
                  <div className="font-semibold text-slate-900">#C97B36</div>
                  <div className="text-slate-500">Ratio AAA · 14.2:1</div>
                </div>
              </div>
              <div className="rounded bg-slate-900 px-3 py-1.5 font-mono text-[10px] text-slate-200">
                --color-primary: #182B49;
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* 2. Capabilities Bento / Numbered Architecture */}
      <section className="space-y-8 border-t border-slate-200 pt-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="max-w-2xl space-y-2"
        >
          <div className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Chaîne de production automatisée
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Du logo brut au dossier normatif complet en 6 étapes guidées
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {WORKFLOW_STEPS.map((item, idx) => (
            <motion.div
              key={item.num}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: idx * 0.08, ease: EASE_OUT }}
              whileHover={{ y: -2 }}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 transition-colors hover:border-slate-300"
            >
              <div>
                <div className="font-mono text-xs font-semibold text-[#C97B36]">
                  {item.num}
                </div>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. Concrete Deliverables Matrix */}
      <section className="space-y-8 border-t border-slate-200 pt-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="flex flex-wrap items-end justify-between gap-4"
        >
          <div className="max-w-2xl space-y-2">
            <div className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Contenu du livrable généré
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Chaque règle calculée à partir de vos véritables fichiers
            </h2>
          </div>
          <a
            href="/demo-charte-aurelia.pdf"
            download
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-900 underline underline-offset-4"
          >
            <FileText className="h-4 w-4" />
            Consulter le PDF démo complet (18 pages)
          </a>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
            className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-7"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
              <ShieldCheck className="h-4 w-4 text-[#C97B36]" />
              Matrice d’accessibilité WCAG & contrôle des usages
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Vérification automatique de chaque combinaison texte/fond avec seuils AA (4.5:1) et AAA (7.0:1), accompagnée de suggestions correctives et des 8 cas d’interdits illustrés directement sur votre logo.
            </p>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="py-2 font-medium">Combinaison</th>
                    <th className="py-2 font-medium">Ratio</th>
                    <th className="py-2 font-medium">AA</th>
                    <th className="py-2 font-medium">AAA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  <tr>
                    <td className="py-2.5 font-sans text-slate-800">
                      Blanc sur Primaire (#182B49)
                    </td>
                    <td className="py-2.5 tabular-nums">14.1 : 1</td>
                    <td className="py-2.5 text-emerald-700">Conforme</td>
                    <td className="py-2.5 text-emerald-700">Conforme</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-sans text-slate-800">
                      Ardoise (#0F172A) sur Surface (#F8FAFC)
                    </td>
                    <td className="py-2.5 tabular-nums">17.1 : 1</td>
                    <td className="py-2.5 text-emerald-700">Conforme</td>
                    <td className="py-2.5 text-emerald-700">Conforme</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-sans text-slate-800">
                      Accent (#C97B36) sur Fond (#FFFFFF)
                    </td>
                    <td className="py-2.5 tabular-nums">3.4 : 1</td>
                    <td className="py-2.5 text-amber-700">Grands titres</td>
                    <td className="py-2.5 text-red-700">Non recommandé</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.1, ease: EASE_OUT }}
            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 lg:col-span-5"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
                <Layers className="h-4 w-4 text-[#C97B36]" />
                Trois directions éditoriales & kit développeur
              </div>
              <p className="text-sm text-slate-600">
                Basculez en un clic entre les mises en page Classique, Éditorial et Minimaliste, puis exportez l’archive complète :
              </p>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <Palette className="h-3.5 w-3.5 text-slate-500" />
                  Nuanciers 100–900, RGB, HSL, CMJN et dégradés
                </li>
                <li className="flex items-center gap-2">
                  <Type className="h-3.5 w-3.5 text-slate-500" />
                  Polices WOFF2 embarquées et échelle typographique H1–Caption
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-slate-500" />
                  Maquettes de carte de visite, en-tête de facture et signature e-mail
                </li>
              </ul>
            </div>
            <pre className="mt-5 overflow-x-auto rounded-lg bg-slate-900 p-3.5 font-mono text-[11px] leading-relaxed text-slate-200">
{`:root {
  --color-primary: #182B49;
  --color-accent: #C97B36;
  --font-heading: 'Cormorant Garamond';
  --radius-md: 8px;
}`}
            </pre>
          </motion.div>
        </div>
      </section>

      {/* 4. GEO Technical Specification & FAQ */}
      <section
        aria-labelledby="geo-specs-heading"
        className="space-y-10 border-t border-slate-200 pt-14"
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="grid grid-cols-1 gap-8 lg:grid-cols-12"
        >
          <div className="space-y-3 lg:col-span-4">
            <div className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Référentiel technique
            </div>
            <h2
              id="geo-specs-heading"
              className="text-2xl font-bold tracking-tight text-slate-900"
            >
              Ce que CharteForge automatise pour chaque marque
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">
              Toutes les spécifications graphiques et valeurs d’accessibilité sont déterministes, calculées côté serveur à partir de vos fichiers sources et livrées prêtes pour l’impression comme pour le développement front-end.
            </p>
          </div>

          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-8">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <dt className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-500">
                Formats d’entrée acceptés
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-slate-800">
                Logos <strong>SVG</strong> (assainis automatiquement), <strong>PNG</strong>, <strong>JPG</strong> et <strong>WebP</strong> jusqu’à 10 Mo ; polices <strong>TTF</strong>, <strong>OTF</strong>, <strong>WOFF2</strong> et Google Fonts.
              </dd>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <dt className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-500">
                Calculs chromatiques &amp; WCAG
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-slate-800">
                Conversions <strong>HEX, RGB, HSL, CMJN</strong>, échelles de nuances <strong>100–900</strong>, 2 dégradés signatures et matrice <strong>WCAG 2.1 AA (4,5:1) / AAA (7,0:1)</strong>.
              </dd>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <dt className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-500">
                Livrables document &amp; code
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-slate-800">
                <strong>PDF A4</strong> (paysage ou portrait, jusqu’à <strong>18 chapitres</strong> en français ou en anglais) et archive ZIP avec <code className="font-mono text-xs">tokens.css</code>, <code className="font-mono text-xs">tailwind.config.js</code> et <code className="font-mono text-xs">brand.json</code>.
              </dd>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <dt className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-500">
                Modèle tarifaire transparent
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-slate-800">
                <strong>Offre Gratuite (0 €/mois)</strong> pour tester avec 1 charte enregistrée ; <strong>Offre Pro (5 €/mois)</strong> pour des chartes illimitées, exports sans filigrane et liens de partage privés.
              </dd>
            </div>
          </dl>
        </motion.div>

        <div className="space-y-6 border-t border-slate-200 pt-12">
          <div className="max-w-2xl space-y-2">
            <div className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Questions fréquentes
            </div>
            <h2
              id="faq-heading"
              className="text-2xl font-bold tracking-tight text-slate-900"
            >
              Tout savoir sur la génération de charte graphique
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {FAQ_ITEMS.map((item, idx) => (
              <motion.article
                key={item.question}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.4, delay: (idx % 2) * 0.06, ease: EASE_OUT }}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <h3 className="text-sm font-semibold text-slate-900">
                  {item.question}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  {item.answer}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Final Conversion Band */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.55, ease: EASE_OUT }}
        className="rounded-xl border border-slate-900 bg-slate-900 px-6 py-10 text-white sm:px-10"
      >
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-xl space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">
              Accédez au Studio CharteForge dès maintenant
            </h2>
            <p className="text-sm text-slate-300">
              Connectez-vous avec Google ou créez un compte par e-mail (validation instantanée via Brevo) pour ouvrir le Studio, enregistrer vos chartes et générer votre premier PDF.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <motion.button
              type="button"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={onViewPricing}
              className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 whitespace-nowrap"
            >
              Voir les tarifs
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onStartAuth('register')}
              className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100 whitespace-nowrap"
            >
              Se connecter / Créer un compte
            </motion.button>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
