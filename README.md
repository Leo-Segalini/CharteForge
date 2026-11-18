# CharteForge — Générateur automatique de chartes graphiques PDF & Design Tokens

Application web SaaS permettant à toute marque ou agence d'importer son logo, ses polices et ses couleurs pour générer un brand book complet en PDF (via Playwright Chromium headless) ainsi que ses design tokens (`tokens.css`, `tailwind.config.js`, `brand.json`, pack ZIP).

## Architecture technique

- **Frontend** : React 19 + TypeScript + Tailwind CSS v4 (Vite)
- **Backend** : Express (`server.ts`) avec API REST, validation MIME/taille et limitation de débit (`express-rate-limit`)
- **Base de données** : PostgreSQL (Cloud SQL) avec Drizzle ORM (`src/db/schema.ts`)
- **Authentification** : Firebase Authentication (Google Sign-In) vérifiée côté serveur via `firebase-admin`
- **Traitement d'images & SVG** : `sharp` (analyse raster, extraction de palette dominante, masques monochromes alpha) + `svgo` & assainissement XML strict
- **Analyse & conversion de polices** : `opentype.js` (familles, graisses, glyphes FR/`€`/`« »`, axes variables) + `wawoff2` (compression WOFF2 embarquée dans le web et le PDF)
- **Moteur PDF & Aperçu fidèle** : `src/shared/brandbook/renderer.ts` partagé à l'identique entre la prévisualisation page par page (`<iframe srcDoc>`) et Playwright (`playwright-core` + Chromium headless)
- **Rédaction assistée** : API Gemini côté serveur (`@google/genai`) pour générer les textes d'introduction de chaque section

## Variables d'environnement

Copiez `.env.example` et renseignez les variables suivantes :

- `GEMINI_API_KEY` : clé API Gemini utilisée uniquement côté serveur (`/api/ai/section-copy`)
- `APP_URL` : URL publique de l'application
- `SQL_HOST`, `SQL_USER`, `SQL_PASSWORD`, `SQL_DB_NAME`, `SQL_ADMIN_USER`, `SQL_ADMIN_PASSWORD` : injectées par Cloud SQL pour Drizzle ORM
- `STRIPE_SECRET_KEY` *(optionnel)* : clé secrète Stripe (`sk_...`) pour ouvrir des sessions Stripe Checkout réelles ; en l'absence de clé, le mode bac à sable permet de tester l'activation de l'offre Pro directement en base

## Installation et démarrage

```bash
npm install
npm run dev
```

L'application est servie sur `http://localhost:3000`.

### Production

```bash
npm run build
npm start
```

## Playwright & Chromium

Le moteur PDF détecte automatiquement `chrome-headless-shell` dans `/ms-playwright` ou `/root/.cache/ms-playwright`. En environnement local vierge, installez Chromium avec :

```bash
npx playwright install chromium
```

## Données de démonstration & Exemple PDF

- La marque **Aurelia Atelier** (logo vectoriel, déclinaisons monochrome/négative/monogramme, palette WCAG vérifiée, typographies et 18 sections) est préchargée dans le Studio.
- Un exemple PDF généré par Playwright est disponible dans `public/demo-charte-aurelia.pdf` (et téléchargeable directement depuis l'interface). Pour le régénérer :

```bash
npx tsx scripts/generateDemoPdf.ts
```

## Tests automatisés

```bash
npm test
```

Les tests couvrent le calcul des contrastes WCAG 2.1, l'assainissement SVG et la génération automatique de variantes de logo, ainsi que le rendu PDF multi-pages via Playwright.
