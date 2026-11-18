# Magma Soft Site — Implementation Plan

**Goal:** Appliquer Magma Soft à toute l’UI plateforme (landing + shell).

**Architecture:** Remplacer tokens CSS → primitives → LandingPage → App/Auth/Dashboard/Billing/Admin/BrandLogo.

**Tech:** React 19, Tailwind v4, Lucide, Motion

## Tasks

### Task 1: Tokens + primitives + logo
- Modify `src/index.css`, `index.html`, `src/components/ui/*`, `BrandLogo.tsx`

### Task 2: Landing Magma
- Rewrite `src/components/LandingPage.tsx` (hero, atelier démo, méthode, CTA, footer content)

### Task 3: Shell produit
- Restyle `App.tsx`, Auth, Dashboard, Billing, Admin, Splash/SharedViewer léger

### Task 4: Doc + vérifs
- `documentation/` + `npm run lint` / `build` / `test`
