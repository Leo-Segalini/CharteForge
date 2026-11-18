/**
 * Préfixe un asset du dossier `public/` avec la base Vite.
 * Sur GitHub Pages : `/CharteForge/…` ; en local : `/…`.
 */
export function publicUrl(assetPath: string): string {
  const base = import.meta.env.BASE_URL || '/';
  const normalized = assetPath.replace(/^\/+/, '');
  return `${base}${normalized}`;
}
