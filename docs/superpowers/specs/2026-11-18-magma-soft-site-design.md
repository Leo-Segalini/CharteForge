# Spec — Magma Soft (site entier)

**Date :** 2026-11-18  
**Statut :** Approuvé (approche A, périmètre 3)  
**Source :** https://magma-robot-02080050.figma.site/

## Objectif

Remplacer Studio Precision par le design **Magma Soft** sur landing + shell produit (Auth, Dashboard, Billing, Admin, chrome App/Studio).

## Tokens

| Rôle | Valeur |
|------|--------|
| Surface | `#FAFAF8` |
| Text | `#1D1D31` |
| Muted | `#626273` |
| Violet | `#6559F5` / `#6257F6` |
| CTA navy | `#1D1D31` pills |
| Coral / or | `#FF7A59` · `#FFD66B` · fond `#F5F1FF` |
| Font UI | Plus Jakarta Sans |
| Demo fonts | Outfit, DM Serif Display, Space Grotesk |
| Radius | pills `999px` ; cards ~20–28px |

## Landing (sections)

1. Header : logo violet bars + CharteForge ; nav Atelier/Méthode/Exports ; CTA pill « Créer ma charte »
2. Hero centré : badge IA, H1 avec « enfin. » violet + underline coral, sous-texte, CTAs, social proof
3. Atelier : chat + preview Soléa (logo, palette, typos, graphiques) — UI démo locale
4. Méthode : steps 01–05 accordion
5. CTA kit + card Soléa PDF
6. Footer soft

## Shell

Boutons pills navy/violet, surfaces soft, cards arrondies, focus violet. Stepper Studio restylé. Auth/Dashboard/Billing/Admin alignés.

## Hors scope

Chat Gemini réel ; PDF renderer client ; logique API auth/billing.

## Acceptation

Landing proche du site Figma ; shell cohérent Magma ; lint/build/tests OK ; doc HTML à jour.
