export type SeoRouteKey =
  | 'landing'
  | 'billing'
  | 'auth'
  | 'studio'
  | 'dashboard'
  | 'admin'
  | 'share';

export interface RouteSeoMeta {
  key: SeoRouteKey;
  path: string;
  title: string;
  description: string;
  robots: string;
}

export interface FaqEntry {
  question: string;
  answer: string;
}

export const SITE_NAME = 'CharteForge';
export const OG_IMAGE_PATH = '/og-charteforge.png';
export const OG_IMAGE_ALT =
  'CharteForge — Exemple de fiche de charte graphique PDF, zone d’exclusion 2X et design tokens CSS';

export const ROUTE_SEO_META: Record<SeoRouteKey, RouteSeoMeta> = {
  landing: {
    key: 'landing',
    path: '/',
    title: 'CharteForge — Charte graphique PDF & Design System',
    description:
      'Importez logo, polices et couleurs pour générer automatiquement une charte graphique PDF d’agence, matrice WCAG et design tokens.',
    robots:
      'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  },
  billing: {
    key: 'billing',
    path: '/tarifs',
    title: 'Tarifs CharteForge — Offre Gratuite et Pro à 5 €/mois',
    description:
      'Comparez l’offre Gratuite (0 €) et l’offre Pro (5 €/mois) : chartes illimitées, PDF A4 sans filigrane, tokens CSS/Tailwind/JSON et partage privé.',
    robots:
      'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  },
  auth: {
    key: 'auth',
    path: '/connexion',
    title: 'Connexion & Inscription — CharteForge',
    description:
      'Connectez-vous avec Google ou créez un compte par e-mail pour accéder au Studio CharteForge et générer votre charte graphique.',
    robots: 'noindex, nofollow',
  },
  studio: {
    key: 'studio',
    path: '/studio',
    title: 'Studio de création — CharteForge',
    description:
      'Atelier guidé en 6 étapes pour configurer votre marque, logo, palette WCAG, typographies et exporter votre brand book PDF.',
    robots: 'noindex, nofollow',
  },
  dashboard: {
    key: 'dashboard',
    path: '/dashboard',
    title: 'Tableau de bord — CharteForge',
    description:
      'Retrouvez, dupliquez et partagez vos chartes graphiques et dossiers de marque enregistrés dans CharteForge.',
    robots: 'noindex, nofollow',
  },
  admin: {
    key: 'admin',
    path: '/admin',
    title: 'Administration — CharteForge',
    description: 'Panneau de gestion et statistiques de la plateforme CharteForge.',
    robots: 'noindex, nofollow',
  },
  share: {
    key: 'share',
    path: '/',
    title: 'Charte graphique partagée — CharteForge',
    description:
      'Consultation privée en lecture seule d’une charte graphique générée avec CharteForge.',
    robots: 'noindex, nofollow',
  },
};

export function resolveRouteKeyFromPath(
  pathname: string,
  hasShareParam = false
): SeoRouteKey {
  if (hasShareParam) return 'share';
  const normalized = pathname.replace(/\/+$/, '') || '/';
  switch (normalized) {
    case '/tarifs':
      return 'billing';
    case '/connexion':
      return 'auth';
    case '/studio':
      return 'studio';
    case '/dashboard':
      return 'dashboard';
    case '/admin':
      return 'admin';
    default:
      return 'landing';
  }
}

export const FAQ_ITEMS: FaqEntry[] = [
  {
    question: 'Qu’est-ce que CharteForge et à qui s’adresse la plateforme ?',
    answer:
      'CharteForge est une plateforme SaaS destinée aux studios graphiques, freelances, agences et équipes produit qui souhaitent transformer un logo, des polices et une palette de couleurs en un brand book PDF complet de niveau agence et un kit de design tokens prêt pour le développement.',
  },
  {
    question: 'Quels formats de logos et de polices sont acceptés ?',
    answer:
      'Pour les logos, CharteForge accepte les fichiers SVG (recommandé pour le tracé vectoriel), PNG, JPG et WebP jusqu’à 10 Mo. Les SVG sont automatiquement assainis et les déclinaisons monochrome noir, négative blanc, sans baseline et monogramme sont générées automatiquement. Pour la typographie, vous pouvez importer vos fichiers TTF, OTF ou WOFF2 ou choisir parmi Google Fonts.',
  },
  {
    question: 'Comment fonctionne le contrôle d’accessibilité des couleurs WCAG 2.1 ?',
    answer:
      'Chaque couleur ajoutée (primaire, secondaire, accent, fond, surface, texte, succès, erreur, avertissement) reçoit ses valeurs HEX, RGB, HSL et CMJN indicatives ainsi que ses nuances de 100 à 900. CharteForge calcule en direct les ratios de contraste texte/fond selon les seuils WCAG AA (4,5:1) et AAA (7,0:1) et propose automatiquement une alternative plus lisible en cas de non-conformité.',
  },
  {
    question: 'Que contient le pack livré lors de l’export ?',
    answer:
      'Vous obtenez un document PDF A4 (paysage ou portrait) composé de 18 chapitres configurables en français ou en anglais (couverture, mission, logotype, zone d’exclusion, interdits, palette, accessibilité, typographie, composants UI, maquettes carte de visite et signature e-mail), accompagné d’une archive ZIP incluant tokens.css, tailwind.config.js, brand.json, vos logos déclinés et les polices WOFF2.',
  },
  {
    question: 'Quelle est la différence entre l’offre Gratuite et l’offre Pro à 5 € / mois ?',
    answer:
      'L’offre Gratuite (0 € / mois) permet de créer et enregistrer 1 charte graphique, d’accéder aux 18 sections, au contrôle WCAG et à l’export PDF avec un filigrane discret. L’offre Pro à 5 € / mois débloque un nombre illimité de chartes et de versions, l’export PDF haute fidélité sans filigrane, le pack ZIP complet des design tokens et les liens de partage privés avec date d’expiration.',
  },
  {
    question: 'Comment tester un exemple concret de charte graphique générée ?',
    answer:
      'Vous pouvez télécharger gratuitement le dossier PDF complet d’exemple « Aurelia Atelier » (18 pages A4 générées par le moteur Chromium de CharteForge) directement depuis la page d’accueil ou le pied de page, sans création de compte préalable.',
  },
];

export function buildStructuredDataGraph(origin: string): Record<string, unknown> {
  const cleanOrigin = origin.replace(/\/$/, '');

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${cleanOrigin}/#organization`,
        name: SITE_NAME,
        url: `${cleanOrigin}/`,
        logo: {
          '@type': 'ImageObject',
          url: `${cleanOrigin}/favicon.svg`,
        },
        description:
          'Plateforme SaaS de génération automatisée de chartes graphiques professionnelles en PDF et de design tokens.',
      },
      {
        '@type': 'WebSite',
        '@id': `${cleanOrigin}/#website`,
        url: `${cleanOrigin}/`,
        name: SITE_NAME,
        inLanguage: 'fr-FR',
        publisher: {
          '@id': `${cleanOrigin}/#organization`,
        },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${cleanOrigin}/#software`,
        name: SITE_NAME,
        applicationCategory: 'DesignApplication',
        applicationSubCategory: 'Brand Guidelines & Design System Generator',
        operatingSystem: 'Web',
        inLanguage: ['fr', 'en'],
        url: `${cleanOrigin}/`,
        image: `${cleanOrigin}${OG_IMAGE_PATH}`,
        screenshot: `${cleanOrigin}${OG_IMAGE_PATH}`,
        description:
          'Générateur automatisé de chartes graphiques d’agence en PDF A4 (18 chapitres) et kit développeur (CSS, Tailwind, JSON) à partir de votre logo, vos couleurs et vos polices.',
        featureList: [
          'Analyse SVG/PNG/WebP et génération automatique de variantes (monochrome noir, négative blanc, monogramme)',
          'Calcul automatique des valeurs HEX, RGB, HSL, CMJN et échelles 100 à 900',
          'Matrice de contraste WCAG 2.1 AA et AAA en temps réel avec suggestions correctives',
          'Conversion et embarquement natif des polices TTF, OTF et WOFF2 dans le PDF',
          'Rendu PDF A4 paysage ou portrait jusqu’à 18 chapitres via Chromium headless',
          'Export ZIP développeur : tokens.css, tailwind.config.js, brand.json et logos',
        ],
        offers: [
          {
            '@type': 'Offer',
            name: 'Offre Gratuite',
            price: '0',
            priceCurrency: 'EUR',
            url: `${cleanOrigin}/tarifs`,
            description:
              '1 charte graphique enregistrée, aperçu complet des 18 sections, matrice WCAG et export PDF avec filigrane discret.',
          },
          {
            '@type': 'Offer',
            name: 'Offre Pro',
            price: '5',
            priceCurrency: 'EUR',
            url: `${cleanOrigin}/tarifs`,
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              price: '5',
              priceCurrency: 'EUR',
              billingDuration: 'P1M',
              unitText: 'MONTH',
            },
            description:
              'Chartes graphiques illimitées, export PDF sans filigrane, archive ZIP complète (CSS, Tailwind, JSON, logos, WOFF2) et partage privé.',
          },
        ],
      },
      {
        '@type': 'HowTo',
        '@id': `${cleanOrigin}/#howto`,
        name: 'Comment créer une charte graphique PDF professionnelle avec CharteForge',
        description:
          'Parcours guidé en 6 étapes pour produire un brand book PDF complet et ses design tokens.',
        totalTime: 'PT5M',
        step: [
          {
            '@type': 'HowToStep',
            position: 1,
            name: 'La marque',
            text: 'Renseignez le nom de la marque, la baseline, le secteur d’activité, la description et les valeurs directrices en français ou en anglais.',
          },
          {
            '@type': 'HowToStep',
            position: 2,
            name: 'Le logo',
            text: 'Importez votre logo (SVG, PNG, JPG ou WebP) pour assainir les tracés, calculer la zone d’exclusion et générer les déclinaisons monochrome, négative et monogramme.',
          },
          {
            '@type': 'HowToStep',
            position: 3,
            name: 'Les couleurs',
            text: 'Définissez votre palette par rôle, consultez les valeurs RGB/HSL/CMJN et vérifiez la conformité WCAG 2.1 AA/AAA.',
          },
          {
            '@type': 'HowToStep',
            position: 4,
            name: 'Les polices',
            text: 'Importez vos typographies TTF, OTF ou WOFF2 ou choisissez des Google Fonts pour composer votre hiérarchie H1 à Caption.',
          },
          {
            '@type': 'HowToStep',
            position: 5,
            name: 'Contenu & style',
            text: 'Sélectionnez les 18 chapitres à inclure, le gabarit éditorial (Classique, Éditorial ou Minimaliste) et le format A4 paysage ou portrait.',
          },
          {
            '@type': 'HowToStep',
            position: 6,
            name: 'Aperçu & export',
            text: 'Téléchargez votre charte graphique PDF haute fidélité, votre pack ZIP de design tokens ou créez un lien de partage privé.',
          },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${cleanOrigin}/#faq`,
        mainEntity: FAQ_ITEMS.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
    ],
  };
}

export function buildLlmsTxt(origin: string): string {
  const cleanOrigin = origin.replace(/\/$/, '');
  return `# CharteForge

> CharteForge est une plateforme SaaS francophone et anglophone de génération automatisée de chartes graphiques professionnelles en PDF (brand books A4) et de design tokens pour studios, agences, freelances et équipes produit.

## Résumé produit

À partir d’un logo, d’une palette de couleurs et de polices importées, CharteForge calcule automatiquement les règles graphiques normatives et compile un dossier de charte graphique paginé en PDF via Chromium headless ainsi qu’un kit développeur complet.

## Liens principaux

- [Page d’accueil et présentation](${cleanOrigin}/): Présentation de l’atelier automatisé, démonstration interactive et matrice des livrables.
- [Tarifs et abonnements](${cleanOrigin}/tarifs): Comparatif détaillé entre l’Offre Gratuite (0 €/mois) et l’Offre Pro (5 €/mois).
- [Exemple de charte graphique PDF (18 pages)](${cleanOrigin}/demo-charte-aurelia.pdf): Brand book complet généré pour la marque fictive « Aurelia Atelier ».
- [Documentation technique détaillée pour agents IA](${cleanOrigin}/llms-full.txt): Spécification complète des formats, 18 chapitres PDF, calculs WCAG, tokens exportés et FAQ.

## Capacités clés

- **Assistant en 6 étapes avec sauvegarde automatique** : 1. La marque, 2. Le logo, 3. Les couleurs, 4. Les polices, 5. Contenu & style, 6. Aperçu & export.
- **Traitement logo & SVG** : Import SVG, PNG, JPG, WebP (10 Mo max) ; nettoyage de sécurité SVG ; détection de qualité ; génération automatique des versions monochrome noir, monochrome blanc, sans baseline, fond sombre/clair et recadrage monogramme.
- **Système colorimétrique & accessibilité WCAG 2.1** : Attribution de rôles sémantiques, conversion HEX/RGB/HSL/CMJN indicatif, échelles 100–900, 2 dégradés signatures et contrôle en direct des contrastes AA (4,5:1) et AAA (7,0:1).
- **Typographie native** : Import TTF/OTF/WOFF2 ou Google Fonts, conversion WOFF2 et intégration directe dans le PDF.
- **Livrables** : PDF A4 (paysage ou portrait, gabarits Classique, Éditorial ou Minimaliste) jusqu’à 18 chapitres, archive ZIP (\`tokens.css\`, \`tailwind.config.js\`, \`brand.json\`, logos, polices) et liens de partage privés.

## Tarification

- **Offre Gratuite (0 € / mois)** : 1 charte graphique enregistrée, aperçu des 18 chapitres, contrôle WCAG, export PDF avec filigrane discret.
- **Offre Pro (5 € / mois)** : Chartes et versions illimitées, export PDF haute fidélité sans filigrane, archive ZIP complète avec design tokens, liens de partage privés avec expiration.
`;
}

export function buildLlmsFullTxt(origin: string): string {
  const cleanOrigin = origin.replace(/\/$/, '');
  const faqBlock = FAQ_ITEMS.map(
    (item) => `### ${item.question}\n\n${item.answer}`
  ).join('\n\n');

  return `# CharteForge — Référentiel complet (GEO / LLMs)

URL publique : ${cleanOrigin}/
Tarifs : ${cleanOrigin}/tarifs
Exemple PDF : ${cleanOrigin}/demo-charte-aurelia.pdf

## 1. Définition et proposition de valeur

CharteForge automatise la création de dossiers de charte graphique (brand books) comparables aux livrables d’agences de design. Au lieu de mettre en page manuellement des dizaines de planches dans Illustrator ou InDesign, l’utilisateur importe ses actifs bruts (logo, polices, couleurs) et obtient :
1. Un **brand book PDF paginé en A4** (paysage ou portrait) généré par Chromium headless avec polices réelles embarquées.
2. Un **kit Design System pour développeurs** au format ZIP contenant \`tokens.css\`, \`tailwind.config.js\`, \`brand.json\`, les variantes de logos et les fichiers WOFF2.
3. Un **lien de partage privé** en lecture seule avec durée de validité configurable.

## 2. Architecture du parcours utilisateur (6 étapes)

1. **Étape 1 — La marque** : Nom, baseline optionnelle, secteur d’activité, description éditoriale, 3 à 5 valeurs directrices, langue du document (\`fr\` ou \`en\`).
2. **Étape 2 — Le logo** : Import SVG (recommandé), PNG, JPG ou WebP jusqu’à 10 Mo ; contrôle de résolution, ratio et transparence ; assainissement SVG ; extraction de couleurs dominantes ; recadrage monogramme ; génération automatique des variantes (principal, horizontal, vertical, monochrome noir, monochrome blanc, négatif sur fond sombre, version sans baseline).
3. **Étape 3 — Les couleurs** : Rôles sémantiques (\`primary\`, \`secondary\`, \`accent\`, \`background\`, \`surface\`, \`text\`, \`textSecondary\`, \`border\`, \`success\`, \`error\`, \`warning\`) ; calcul HEX, RGB, HSL, CMJN indicatif ; génération des nuances \`100\` à \`900\` ; matrice d’accessibilité WCAG 2.1 (niveaux AA et AAA) avec suggestions correctives automatiques.
4. **Étape 4 — Les polices** : Import TTF, OTF, WOFF2 ou sélection Google Fonts ; lecture des métadonnées de fonte et vérification des glyphes français ; définition de l’échelle modulaire (H1 à Caption).
5. **Étape 5 — Contenu & style** : Activation/désactivation jusqu’à 18 chapitres (couverture, somme éditoriale, histoire & valeurs, logotype, déclinaisons, zone d’exclusion 2X, usages interdits, palette principale, palette étendue, dégradés, accessibilité WCAG, typographie, hiérarchie, iconographie, mise en page & grilles, composants UI, supports imprimés & digitaux, design tokens). Choix du gabarit (\`classic\`, \`editorial\`, \`minimal\`) et orientation (\`landscape\` ou \`portrait\`).
6. **Étape 6 — Aperçu & export** : Prévisualisation interactive paginée, génération PDF instantanée, export ZIP développeur, gestion des versions et création de liens de partage privés.

## 3. Tarification transparente

| Caractéristique | Offre Gratuite | Offre Pro |
| --- | --- | --- |
| Prix | 0 € / mois | 5 € / mois |
| Nombre de chartes enregistrées | 1 charte | Illimité + historique de versions |
| Chapitres & contrôle WCAG 2.1 | Complet (18 sections) | Complet (18 sections) |
| Export PDF A4 Chromium | Avec filigrane discret | Haute fidélité sans filigrane |
| Pack ZIP Design Tokens (CSS, Tailwind, JSON, WOFF2) | — | Inclus |
| Liens de partage privés | — | Inclus avec expiration |

## 4. Authentification et sécurité

- Connexion par **Google** (Firebase Auth) ou par **e-mail et mot de passe** avec validation d’adresse e-mail par jeton temporaire envoyé via Brevo.
- Nettoyage strict des fichiers SVG importés pour prévenir toute injection de scripts ou références externes.
- Paiement et gestion de l’abonnement Pro assurés par Stripe Checkout.

## 5. Questions fréquentes (FAQ)

${faqBlock}
`;
}
