/** Catalogue curaté Google Fonts (sans clé API) — familles populaires + métadonnées. */

export type GoogleFontCategory =
  | 'Sans'
  | 'Serif'
  | 'Display'
  | 'Mono'
  | 'Handwriting';

export interface GoogleFontEntry {
  family: string;
  category: GoogleFontCategory;
  weights: string[];
  /** Libellé FR court pour l’UI */
  vibe: string;
}

export const GOOGLE_FONTS_CATALOG: GoogleFontEntry[] = [
  // Sans — UI / contemporain
  { family: 'Plus Jakarta Sans', category: 'Sans', weights: ['400', '500', '600', '700'], vibe: 'Géométrique moderne' },
  { family: 'Outfit', category: 'Sans', weights: ['400', '500', '600', '700'], vibe: 'Sans contemporaine' },
  { family: 'Inter', category: 'Sans', weights: ['400', '500', '600', '700'], vibe: 'Interface neutre' },
  { family: 'Manrope', category: 'Sans', weights: ['400', '500', '600', '700'], vibe: 'Néo-grotesque' },
  { family: 'DM Sans', category: 'Sans', weights: ['400', '500', '700'], vibe: 'UI claire' },
  { family: 'Public Sans', category: 'Sans', weights: ['400', '500', '600', '700'], vibe: 'Corps éditorial' },
  { family: 'Space Grotesk', category: 'Sans', weights: ['400', '500', '600', '700'], vibe: 'Créative & tech' },
  { family: 'Poppins', category: 'Sans', weights: ['400', '500', '600', '700'], vibe: 'Géométrique friendly' },
  { family: 'Nunito Sans', category: 'Sans', weights: ['400', '600', '700'], vibe: 'Douce & lisible' },
  { family: 'Nunito', category: 'Sans', weights: ['400', '600', '700'], vibe: 'Arrondie chaleureuse' },
  { family: 'Work Sans', category: 'Sans', weights: ['400', '500', '600', '700'], vibe: 'Produit digital' },
  { family: 'Figtree', category: 'Sans', weights: ['400', '500', '600', '700'], vibe: 'Startup soft' },
  { family: 'Sora', category: 'Sans', weights: ['400', '500', '600', '700'], vibe: 'Futuriste douce' },
  { family: 'Urbanist', category: 'Sans', weights: ['400', '500', '600', '700'], vibe: 'Urbaine géométrique' },
  { family: 'Albert Sans', category: 'Sans', weights: ['400', '500', '600', '700'], vibe: 'Corporate clean' },
  { family: 'IBM Plex Sans', category: 'Sans', weights: ['400', '500', '600', '700'], vibe: 'Institutionnelle' },
  { family: 'Source Sans 3', category: 'Sans', weights: ['400', '600', '700'], vibe: 'Adobe open' },
  { family: 'Open Sans', category: 'Sans', weights: ['400', '600', '700'], vibe: 'Universelle' },
  { family: 'Roboto', category: 'Sans', weights: ['400', '500', '700'], vibe: 'Android / Material' },
  { family: 'Montserrat', category: 'Sans', weights: ['400', '500', '600', '700'], vibe: 'Marque premium' },
  { family: 'Raleway', category: 'Sans', weights: ['400', '500', '600', '700'], vibe: 'Élégante fine' },
  { family: 'Lato', category: 'Sans', weights: ['400', '700'], vibe: 'Classique web' },
  { family: 'Mulish', category: 'Sans', weights: ['400', '600', '700'], vibe: 'Support & SaaS' },
  { family: 'Karla', category: 'Sans', weights: ['400', '500', '600', '700'], vibe: 'Humaniste courte' },
  { family: 'Lexend', category: 'Sans', weights: ['400', '500', '600', '700'], vibe: 'Lisibilité maximale' },
  { family: 'Atkinson Hyperlegible', category: 'Sans', weights: ['400', '700'], vibe: 'Accessibilité' },
  { family: 'Schibsted Grotesk', category: 'Sans', weights: ['400', '500', '600', '700'], vibe: 'Presse nordique' },
  { family: 'Bricolage Grotesque', category: 'Sans', weights: ['400', '500', '600', '700'], vibe: 'Expressive' },
  { family: 'Red Hat Text', category: 'Sans', weights: ['400', '500', '700'], vibe: 'Open source' },
  { family: 'Instrument Sans', category: 'Sans', weights: ['400', '500', '600', '700'], vibe: 'Design tools' },
  { family: 'Onest', category: 'Sans', weights: ['400', '500', '600', '700'], vibe: 'Product UI' },
  { family: 'Josefin Sans', category: 'Sans', weights: ['400', '500', '600', '700'], vibe: 'Élégante fashion' },
  { family: 'Barlow', category: 'Sans', weights: ['400', '500', '600', '700'], vibe: 'Condensable UI' },

  // Serif
  { family: 'Fraunces', category: 'Serif', weights: ['400', '600', '700'], vibe: 'Éditoriale soft' },
  { family: 'Playfair Display', category: 'Serif', weights: ['400', '600', '700'], vibe: 'Prestige' },
  { family: 'Cormorant Garamond', category: 'Serif', weights: ['400', '600', '700'], vibe: 'Luxe & culture' },
  { family: 'Lora', category: 'Serif', weights: ['400', '500', '600', '700'], vibe: 'Lecture longue' },
  { family: 'Source Serif 4', category: 'Serif', weights: ['400', '600', '700'], vibe: 'Presse & rapport' },
  { family: 'Libre Baskerville', category: 'Serif', weights: ['400', '700'], vibe: 'Classique livre' },
  { family: 'Merriweather', category: 'Serif', weights: ['400', '700'], vibe: 'Écran confort' },
  { family: 'EB Garamond', category: 'Serif', weights: ['400', '500', '600', '700'], vibe: 'Tradition fine' },
  { family: 'Crimson Pro', category: 'Serif', weights: ['400', '600', '700'], vibe: 'Édition numérique' },
  { family: 'Literata', category: 'Serif', weights: ['400', '600', '700'], vibe: 'Livres numériques' },
  { family: 'Newsreader', category: 'Serif', weights: ['400', '600', '700'], vibe: 'Journal' },
  { family: 'DM Serif Display', category: 'Serif', weights: ['400'], vibe: 'Titres éditoriaux' },
  { family: 'Instrument Serif', category: 'Serif', weights: ['400'], vibe: 'Display design' },
  { family: 'Libre Caslon Text', category: 'Serif', weights: ['400', '700'], vibe: 'Caslon classique' },
  { family: 'Spectral', category: 'Serif', weights: ['400', '600', '700'], vibe: 'Long-form' },

  // Display
  { family: 'Bebas Neue', category: 'Display', weights: ['400'], vibe: 'Impact condensé' },
  { family: 'Oswald', category: 'Display', weights: ['400', '500', '600', '700'], vibe: 'Titres fort' },
  { family: 'Archivo Black', category: 'Display', weights: ['400'], vibe: 'Affiche bold' },
  { family: 'Anton', category: 'Display', weights: ['400'], vibe: 'Poster' },
  { family: 'Syne', category: 'Display', weights: ['400', '600', '700'], vibe: 'Art direction' },
  { family: 'Unbounded', category: 'Display', weights: ['400', '600', '700'], vibe: 'Futur display' },
  { family: 'Young Serif', category: 'Display', weights: ['400'], vibe: 'Display friendly' },
  { family: 'Kalnia', category: 'Display', weights: ['400', '600', '700'], vibe: 'Titre contemporain' },
  { family: 'Staatliches', category: 'Display', weights: ['400'], vibe: 'Titre condensé' },
  { family: 'Teko', category: 'Display', weights: ['400', '500', '600', '700'], vibe: 'Sport display' },

  // Mono
  { family: 'JetBrains Mono', category: 'Mono', weights: ['400', '500', '600', '700'], vibe: 'Technique & data' },
  { family: 'IBM Plex Mono', category: 'Mono', weights: ['400', '500', '600'], vibe: 'Tabulaire' },
  { family: 'Source Code Pro', category: 'Mono', weights: ['400', '600', '700'], vibe: 'Code Adobe' },
  { family: 'Fira Code', category: 'Mono', weights: ['400', '500', '600', '700'], vibe: 'Ligatures code' },
  { family: 'Roboto Mono', category: 'Mono', weights: ['400', '500', '700'], vibe: 'Mono Material' },
  { family: 'Space Mono', category: 'Mono', weights: ['400', '700'], vibe: 'Mono display' },
  { family: 'Inconsolata', category: 'Mono', weights: ['400', '700'], vibe: 'Mono classique' },
  { family: 'Red Hat Mono', category: 'Mono', weights: ['400', '500', '700'], vibe: 'Mono Red Hat' },

  // Handwriting / script (usage ponctuel)
  { family: 'Caveat', category: 'Handwriting', weights: ['400', '600', '700'], vibe: 'Manuscrite soft' },
  { family: 'Patrick Hand', category: 'Handwriting', weights: ['400'], vibe: 'Notes humaines' },
  { family: 'Kalam', category: 'Handwriting', weights: ['400', '700'], vibe: 'Marker friendly' },
  { family: 'Dancing Script', category: 'Handwriting', weights: ['400', '600', '700'], vibe: 'Script élégant' },
  { family: 'Pacifico', category: 'Handwriting', weights: ['400'], vibe: 'Logo fun' },
];

/** Ancien export attendu par sections.ts / Step4 (compat). */
export type GoogleFontCatalogItem = {
  family: string;
  category: string;
  weights: string[];
};

export function toLegacyCatalogItem(entry: GoogleFontEntry): GoogleFontCatalogItem {
  return {
    family: entry.family,
    category: entry.vibe,
    weights: entry.weights,
  };
}

export function searchGoogleFonts(
  query: string,
  options?: { category?: GoogleFontCategory | 'all'; roleHint?: 'heading' | 'body' | 'mono' },
): GoogleFontEntry[] {
  const q = query.trim().toLowerCase();
  const category = options?.category ?? 'all';
  const roleHint = options?.roleHint;

  let list = GOOGLE_FONTS_CATALOG.filter((font) => {
    if (category !== 'all' && font.category !== category) return false;
    if (!q) return true;
    return (
      font.family.toLowerCase().includes(q) ||
      font.vibe.toLowerCase().includes(q) ||
      font.category.toLowerCase().includes(q)
    );
  });

  if (roleHint === 'mono') {
    list = [...list].sort((a, b) => {
      const am = a.category === 'Mono' ? 0 : 1;
      const bm = b.category === 'Mono' ? 0 : 1;
      return am - bm || a.family.localeCompare(b.family);
    });
  } else if (roleHint === 'heading') {
    list = [...list].sort((a, b) => {
      const rank = (c: GoogleFontCategory) =>
        c === 'Display' || c === 'Serif' ? 0 : c === 'Sans' ? 1 : 2;
      return rank(a.category) - rank(b.category) || a.family.localeCompare(b.family);
    });
  } else {
    list = [...list].sort((a, b) => a.family.localeCompare(b.family));
  }

  return list;
}

export function guessFallback(family: string, role: 'heading' | 'body' | 'mono'): string {
  if (role === 'mono') return 'ui-monospace, monospace';
  const entry = GOOGLE_FONTS_CATALOG.find((f) => f.family === family);
  if (entry?.category === 'Serif' || entry?.category === 'Display') {
    return 'Georgia, serif';
  }
  if (entry?.category === 'Handwriting') return 'cursive';
  if (
    family.includes('Fraunces') ||
    family.includes('Playfair') ||
    family.includes('Lora') ||
    family.includes('Cormorant') ||
    family.includes('Source Serif') ||
    family.includes('Garamond') ||
    family.includes('Serif')
  ) {
    return 'Georgia, serif';
  }
  return 'system-ui, sans-serif';
}
