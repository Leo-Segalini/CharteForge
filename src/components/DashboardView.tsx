import React, { useEffect, useState } from 'react';
import { Copy, Download, FolderPlus, Search, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import type { BrandSummary } from '../server/brandRepository.ts';
import type { BrandBookData } from '../shared/types.ts';
import { slugify } from '../shared/colorEngine.ts';

interface Props {
  onOpenBrand: (brand: BrandBookData) => void;
  onCreateNew: () => void;
  onImportDemo: () => void;
  onGoToBilling: () => void;
}

export function DashboardView({
  onOpenBrand,
  onCreateNew,
  onImportDemo,
  onGoToBilling,
}: Props) {
  const { isAuthenticated, profile, getIdToken, loginWithGoogle } = useAuth();
  const [items, setItems] = useState<BrandSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'generated'>('all');

  const fetchBrands = async () => {
    const token = await getIdToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/brands', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chargement impossible.');
      setItems(data.brands ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur réseau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      void fetchBrands();
    } else {
      setItems([]);
    }
  }, [isAuthenticated]);

  const handleOpen = async (id: number) => {
    const token = await getIdToken();
    if (!token) return;
    const res = await fetch(`/api/brands/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok && data.brand) {
      onOpenBrand(data.brand as BrandBookData);
    }
  };

  const handleDuplicate = async (id: number) => {
    setError(null);
    const token = await getIdToken();
    if (!token) return;
    const res = await fetch(`/api/brands/${id}/duplicate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Duplication impossible.');
      return;
    }
    await fetchBrands();
  };

  const handleDelete = async (id: number) => {
    setError(null);
    const token = await getIdToken();
    if (!token) return;
    const res = await fetch(`/api/brands/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleDownloadPdf = async (id: number, name: string) => {
    const token = await getIdToken();
    if (!token) return;
    const bRes = await fetch(`/api/brands/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const bData = await bRes.json();
    if (!bRes.ok || !bData.brand) return;

    const pdfRes = await fetch('/api/export/pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ brand: bData.brand }),
    });
    if (!pdfRes.ok) return;
    const blob = await pdfRes.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `charte-${slugify(name)}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-2xl rounded-lg border border-slate-200 bg-white p-8 text-center">
        <h2 className="text-xl font-semibold text-slate-900">
          Connectez-vous pour enregistrer vos chartes graphiques
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Votre espace personnel sauvegarde automatiquement vos logos, palettes, polices converties, historiques de versions et liens de partage privés.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => void loginWithGoogle()}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            Se connecter avec Google
          </button>
          <button
            type="button"
            onClick={onImportDemo}
            className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Continuer avec la démo dans le Studio
          </button>
        </div>
      </div>
    );
  }

  const filtered = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sector.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Mes chartes graphiques
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Compte : {profile?.email} · Offre{' '}
            {profile?.plan === 'pro' ? 'Pro (Illimité, sans filigrane)' : 'Gratuite (1 charte)'}
            {profile?.plan === 'free' && (
              <button
                type="button"
                onClick={onGoToBilling}
                className="ml-2 font-medium text-slate-900 underline"
              >
                Passer en Pro
              </button>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onImportDemo}
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
          >
            Créer depuis la démo
          </button>
          <button
            type="button"
            onClick={onCreateNew}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 whitespace-nowrap"
          >
            <FolderPlus className="h-3.5 w-3.5" />
            Nouvelle charte
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Search + Segmented Status Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une marque…"
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-slate-900 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
          {(
            [
              { id: 'all', label: 'Toutes' },
              { id: 'draft', label: 'Brouillons' },
              { id: 'generated', label: 'Générées' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-lg border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-10 text-center">
          <p className="text-sm font-medium text-slate-800">
            Aucune charte graphique trouvée dans votre espace.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Créez une nouvelle charte vierge ou importez l’exemple Aurelia Atelier pour démarrer.
          </p>
          <button
            type="button"
            onClick={onImportDemo}
            className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800"
          >
            Importer la charte de démonstration
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Marque</th>
                <th className="px-4 py-3 font-medium">Format & Modèle</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Mise à jour</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => void handleOpen(item.id)}
                      className="flex items-center gap-3 text-left"
                    >
                      <span
                        className="h-8 w-8 shrink-0 rounded border border-slate-200"
                        style={{ backgroundColor: item.primaryColor }}
                      />
                      <div>
                        <div className="font-semibold text-slate-900 hover:underline">
                          {item.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {item.sector || 'Secteur non défini'}
                        </div>
                      </div>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {item.format === 'landscape' ? 'A4 Paysage' : 'A4 Portrait'} ·{' '}
                    {item.template} · v{item.version}.0
                  </td>
                  <td className="px-4 py-3 text-xs font-medium text-slate-700">
                    {item.status === 'generated' ? 'Généré' : 'Brouillon'}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500 tabular-nums">
                    {new Date(item.updatedAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => void handleOpen(item.id)}
                        className="rounded border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                      >
                        Ouvrir
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDownloadPdf(item.id, item.name)}
                        title="Télécharger PDF"
                        className="rounded border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDuplicate(item.id)}
                        title="Dupliquer"
                        className="rounded border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(item.id)}
                        title="Supprimer (RGPD)"
                        className="rounded border border-slate-200 p-1.5 text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
