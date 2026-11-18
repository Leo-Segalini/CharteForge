# CharteForge

<p align="center">
  <img src="public/favicon.svg" alt="CharteForge" width="72" height="72" />
</p>

<p align="center">
  <strong>Générateur automatique de chartes graphiques</strong><br />
  PDF professionnel · Design tokens · Accessibilité WCAG
</p>

<p align="center">
  <a href="#architecture"><img src="https://img.shields.io/badge/Stack-React_19_+_Express-0F172A?style=flat-square" alt="Stack" /></a>
  <a href="#installation"><img src="https://img.shields.io/badge/Node-%3E%3D_20-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node" /></a>
  <a href="#installation"><img src="https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" /></a>
  <a href="https://github.com/Leo-Segalini/CharteForge"><img src="https://img.shields.io/badge/Repo-GitHub-181717?style=flat-square&logo=github" alt="GitHub" /></a>
</p>

---

Importez un logo, des polices et une palette : CharteForge produit un **brand book PDF** (Playwright) et un pack de tokens (`tokens.css`, `tailwind.config.js`, `brand.json`, ZIP logos/polices).

## Parcours Studio (6 étapes)

| # | Étape | Livrable |
|---|--------|----------|
| 1 | Marque | Identité, ton, secteurs |
| 2 | Logo | Variantes, monochrome, monogramme |
| 3 | Couleurs | Rôles, nuances, contrastes WCAG AA/AAA |
| 4 | Polices | Familles, rôles, WOFF2 |
| 5 | Contenu | Textes de sections (assistés Gemini) |
| 6 | Export | Aperçu fidèle + PDF + pack tokens |

## Architecture

```text
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│  React 19 +     │────▶│  Express (server.ts) │────▶│  PostgreSQL     │
│  Tailwind v4    │     │  Auth · Upload · API │     │  Drizzle ORM    │
└─────────────────┘     └──────────┬───────────┘     └─────────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
              Playwright      Gemini API      Stripe
              (PDF book)    (section copy)   (Pro plan)
```

| Couche | Techno |
|--------|--------|
| Frontend | React 19 · TypeScript · Tailwind CSS v4 · Vite 8 |
| API | Express · multer · express-rate-limit |
| Données | PostgreSQL (Cloud SQL) · Drizzle (`src/db/schema.ts`) |
| Auth | Firebase (Google) + e-mail/mot de passe (`firebase-admin`) |
| Images / SVG | `sharp` · `svgo` + assainissement XML |
| Polices | `opentype.js` · `wawoff2` |
| PDF | Renderer partagé `src/shared/brandbook/renderer.ts` → iframe + Playwright |
| IA | Gemini (`@google/genai`) **serveur uniquement** |
| Billing | Stripe Checkout (optionnel) · plans `free` / `pro` |

## Prérequis

- Node.js **≥ 20**
- Compte Firebase (auth)
- PostgreSQL (local ou Cloud SQL)
- Chromium Playwright pour l’export PDF
- Clé Gemini (rédaction assistée) — optionnelle

## Installation

```bash
cp .env.example .env   # renseigner les secrets
npm install
npx playwright install chromium
npm run dev
```

Application : [http://localhost:3000](http://localhost:3000)

### Scripts

| Commande | Rôle |
|----------|------|
| `npm run dev` | Serveur Express + Vite HMR |
| `npm run build` | Build front production |
| `npm start` | Démarrage serveur |
| `npm run lint` | `tsc --noEmit` |
| `npm test` | Tests (contraste, SVG, logos, PDF) |

### Production

```bash
npm run build
npm start
```

## Variables d’environnement

Copiez `.env.example` puis renseignez :

| Variable | Usage |
|----------|--------|
| `GEMINI_API_KEY` | Textes de sections (`/api/ai/section-copy`) — **serveur seul** |
| `APP_URL` | URL publique de l’app |
| `SQL_*` | Connexion PostgreSQL / Cloud SQL |
| `STRIPE_SECRET_KEY` | Checkout Pro (optionnel — sinon sandbox plan) |
| `BREVO_*` | E-mails de vérification |
| `AUTH_SESSION_SECRET` | Sessions e-mail (HMAC) |

> Ne committez jamais `.env`. Les secrets Stripe / Gemini restent côté serveur.

## Playwright & PDF

Le moteur PDF cherche `chrome-headless-shell` dans `/ms-playwright` ou `~/.cache/ms-playwright`. En local :

```bash
npx playwright install chromium
```

**Démo Aurelia Atelier** — marque préchargée (logo, palette WCAG, typo, 18 sections). PDF d’exemple : `public/demo-charte-aurelia.pdf`.

```bash
npx tsx scripts/generateDemoPdf.ts
```

## Sécurité (rappel)

- Uploads : MIME réel, max 10 Mo, SVG assaini, raster via `sharp`
- AuthZ sur chaque mutation de marque (`userId`)
- Rate limit uploads / export / auth
- Isolation multi-tenant des assets (logos, polices)

## Tests

```bash
npm test
```

Couverture : contrastes WCAG 2.1, assainissement SVG, variantes logo, rendu PDF multi-pages.

## Repo

- GitHub : [github.com/Leo-Segalini/CharteForge](https://github.com/Leo-Segalini/CharteForge)
- Licence : usage projet privé — voir le propriétaire du dépôt

---

<p align="center">
  <sub>CharteForge · brand books PDF fidèles à l’aperçu Studio</sub>
</p>
