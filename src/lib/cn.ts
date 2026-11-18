type ClassValue = string | false | null | undefined | ClassValue[];

/** Concatène des classes CSS conditionnelles (sans dépendance externe). */
export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  const walk = (value: ClassValue): void => {
    if (!value) return;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed) out.push(trimmed);
      return;
    }
    if (Array.isArray(value)) value.forEach(walk);
  };
  inputs.forEach(walk);
  return out.join(' ');
}
