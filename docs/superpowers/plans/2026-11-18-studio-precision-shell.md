# Studio Precision Shell — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Appliquer Studio Precision à la landing + shell produit (Auth, Dashboard, Billing, Admin, chrome App).

**Architecture:** Tokens CSS (`@theme` Tailwind v4) → primitives UI → LandingPage port de `code.html` → restyle shell. Hors-scope : Step1–6, PDF renderer.

**Tech Stack:** React 19, Tailwind v4, Lucide, Motion, Vite 8

## Global Constraints

- Tokens et copy alignés `refontedesign/DESIGN.md` + `code.html`
- Lucide uniquement (pas Material Symbols CDN)
- Touch ≥ 44px mobile ; `prefers-reduced-motion`
- Pas de changement API / auth métier
- Commits uniquement si l’utilisateur le demande

---

### Task 1: Tokens + fonts + primitives

**Files:**
- Modify: `src/index.css`, `index.html`
- Create: `src/components/ui/Button.tsx`, `Badge.tsx`, `Card.tsx`, `Input.tsx`, `cn.ts` (ou `src/lib/cn.ts`)

- [ ] Définir `@theme` / `:root` Studio Precision (surfaces, primary-container, secondary ochre, WCAG, spacing, shadows)
- [ ] Fonts : Plus Jakarta Sans 400–800 + JetBrains Mono ; retirer Public Sans du body UI
- [ ] Primitives Button (primary/outline/accent/ghost), Badge WCAG, Card, Input
- [ ] `npm run lint`

### Task 2: LandingPage

**Files:**
- Modify: `src/components/LandingPage.tsx`
- Optionally extract: `src/components/landing/*` si fichier > ~600 lignes

- [ ] Port sections : hero + specimen, 6 steps, WCAG+tokens, specs, FAQ, CTA, footer content (footer global peut rester App)
- [ ] Brancher `onStartAuth` / `onViewPricing` / PDF démo
- [ ] Toast copy tokens ; onglets tokens.css / tailwind / brand.json
- [ ] Motion respect `prefers-reduced-motion`

### Task 3: Shell App + Auth / Dashboard / Billing / Admin

**Files:**
- Modify: `src/App.tsx`, `AuthView.tsx`, `DashboardView.tsx`, `BillingView.tsx`, `AdminView.tsx`
- Léger: `SplashScreen.tsx`, `SharedViewer.tsx` (fonds/tokens)

- [ ] Header/footer/nav : tokens, CTA primary-container, accents ochre
- [ ] Restyle Auth carte + inputs + boutons
- [ ] Restyle Dashboard / Billing / Admin cards, tables, empty states
- [ ] Grep `slate-` / `#F8F9FB` dans fichiers inclus et remplacer

### Task 4: Doc + vérifs

**Files:**
- Create/Update: `documentation/features/studio-precision-shell.html`, `changelog.html`, `index.html`

- [ ] Doc feature + changelog
- [ ] `npm run lint` && `npm run build` && `npm test`

---

**Spec coverage:** tokens §4, landing §5, shell §6, a11y §7, acceptation §8 → Tasks 1–4.
