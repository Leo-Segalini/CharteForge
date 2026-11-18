# Spec — Refonte Studio Precision (Landing + shell produit)

**Date :** 2026-11-18  
**Statut :** Approuvé (approche A, périmètre 2)  
**Sources :** `refontedesign/DESIGN.md`, `refontedesign/code.html`, `refontedesign/screen.png`

## 1. Objectif

Appliquer le design system **Studio Precision** à la landing et au shell produit CharteForge (Auth, Dashboard, Billing, Admin + chrome `App.tsx`), sans toucher au contenu des étapes Studio 1–6 ni au renderer PDF client.

## 2. Périmètre

### Inclus
- Tokens CSS / thème Tailwind v4 (`src/index.css`, polices)
- Composants UI atomiques réutilisables (`Button`, `Badge`, `Card`, `Input` si utile)
- `LandingPage.tsx` — port fidèle de la structure `code.html`
- Shell : header / footer / nav dans `App.tsx`
- Vues : `AuthView`, `DashboardView`, `BillingView`, `AdminView`
- Splash / SharedViewer : alignement tokens de surface uniquement (léger)
- Doc HTML `documentation/` + entrée changelog

### Exclus
- `src/components/steps/Step1` … `Step6` (layout interne wizard)
- `src/shared/brandbook/renderer.ts` et PDF de marque client
- Changements métier API, auth, Stripe, schéma Drizzle

## 3. Approche retenue : A

1. **Fondations** — variables CSS Studio Precision + `@theme` Tailwind v4  
2. **Primitives UI** — boutons / badges / cards / inputs  
3. **Landing** — sections de `code.html` en React (Lucide, pas Material Symbols CDN)  
4. **Shell produit** — remplacer `slate-*` / `#F8F9FB` ad hoc par tokens  
5. **Vérifs** — lint, build, a11y clavier / contraste AA, `prefers-reduced-motion`

## 4. Design tokens (référence)

| Rôle | Valeur |
|------|--------|
| Canvas / background | `#f8f9ff` / `#FFFFFF` / `#F8FAFC` |
| Primary container (CTA) | `#182B49` |
| Surface inverse | `#0F172A` |
| Secondary / accent | `#C97B36` (ochre) ; MD token secondary `#904d06` pour text accents |
| Text | `#0F172A` / `#475569` / `#94A3B8` |
| Border hairline | `#E2E8F0` |
| WCAG pass / warn / fail | `#059669` / `#D97706` / `#E11D48` (+ fills subtle) |
| Font UI | Plus Jakarta Sans |
| Font code / eyebrow | JetBrains Mono |
| Max width | `1280px` |
| Radius contrôles | `8px` ; cards `12–16px` |
| Touch target | ≥ 44×44 px mobile |

Ombres micro-élévation et focus ring navy : selon `DESIGN.md` §§ Elevation & Form Inputs.

## 5. Landing — sections obligatoires

1. Header fixe blur + nav + Connexion + CTA « Créer ma charte graphique »
2. Hero 12 cols : copy + CTAs + trust badges ; specimen Aurelia (zone 2X, variantes, swatches)
3. Processus 6 étapes (grille 3×2)
4. Split matrice WCAG + bloc tokens CSS sombre
5. Specs techniques / livrables / pricing teaser
6. FAQ (réutiliser `FAQ_ITEMS` de `seoConfig` si compatible)
7. CTA bandeau sombre + footer légal

Interactions : toast « copié » pour tokens ; téléchargement `public/demo-charte-aurelia.pdf` ; CTAs branchés `onStartAuth` / `onViewPricing`.

## 6. Shell produit

- Header : logo, nav (Studio / Dashboard / Tarifs / Admin si role), CTA navy, états hover/focus
- Fonds `bg-surface` / `bg-surface-subtle` ; cards `bg-surface-card` + `border-border-hairline`
- Boutons primary → `primary-container` ; accent export → ochre si déjà CTA fort
- Inputs : hauteur 40px+, focus `0 0 0 3px rgba(24,43,73,0.12)`
- Auth : carte centrée, même language visuelle landing
- Dashboard / Billing / Admin : tableaux / listes / empty states cohérents

## 7. Accessibilité & motion

- Contraste AA texte/fond plateforme
- Focus visible partout
- Labels FR, états loading / error / empty
- `prefers-reduced-motion` : désactiver ping / translate hover agressifs

## 8. Critères d’acceptation

- [ ] Landing visuelle proche de `screen.png` / `code.html` (structure + tokens)
- [ ] Auth, Dashboard, Billing, Admin utilisent les tokens Studio Precision
- [ ] Aucune régression auth / navigation / sauvegarde studio (smoke)
- [ ] `npm run lint` + `npm run build` OK
- [ ] Documentation HTML mise à jour

## 9. Risques

| Risque | Mitigation |
|--------|------------|
| Landing trop longue / HTML CDN | Port React + Lucide ; pas de Tailwind CDN |
| Drift classes `slate-*` restantes | Grep post-pass sur shell inclus |
| GitHub Pages sans API | N/A design ; CTAs restent client-side |

## 10. Fichiers prévus

| Fichier | Action |
|---------|--------|
| `src/index.css` | Tokens + theme |
| `src/components/ui/*` | Créer primitives |
| `src/components/LandingPage.tsx` | Refonte |
| `src/App.tsx` | Shell chrome |
| `src/components/AuthView.tsx` | Restyle |
| `src/components/DashboardView.tsx` | Restyle |
| `src/components/BillingView.tsx` | Restyle |
| `src/components/AdminView.tsx` | Restyle |
| `index.html` | Fonts Google si besoin |
| `documentation/features/studio-precision-shell.html` | Doc |
| `documentation/changelog.html` | Entrée |

---

**Self-review :** pas de placeholder TODO ; périmètre 2 explicite ; pas de contradiction avec DESIGN.md ; hors-scope Studio steps / PDF clair.
