import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';

interface AdminOverview {
  stats: {
    totalUsers: number;
    totalBrands: number;
    generatedGuidelines: number;
  };
  users: Array<{
    id: number;
    email: string;
    displayName: string | null;
    role: string;
    plan: string;
    createdAt: string;
  }>;
  config: {
    enabledTemplates?: string[];
    defaultFormat?: string;
  };
}

export function AdminView() {
  const { getIdToken } = useAuth();
  const [data, setData] = useState<AdminOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const token = await getIdToken();
      if (!token) return;
      const res = await fetch('/api/admin/overview', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Accès refusé.');
        return;
      }
      setData(json as AdminOverview);
    };
    void load();
  }, []);

  const toggleTemplate = async (tpl: string) => {
    if (!data) return;
    const current = data.config.enabledTemplates ?? ['classic', 'editorial', 'minimal'];
    const next = current.includes(tpl)
      ? current.filter((t) => t !== tpl)
      : [...current, tpl];
    if (next.length === 0) return;

    const updatedConfig = { ...data.config, enabledTemplates: next };
    setData({ ...data, config: updatedConfig });
    setSaving(true);
    const token = await getIdToken();
    await fetch('/api/admin/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ config: updatedConfig }),
    });
    setSaving(false);
  };

  if (error) {
    return (
      <div className="rounded-full border border-red-200 bg-red-50 p-6 text-sm text-red-800">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-48 animate-pulse rounded-full border border-border-hairline bg-surface-canvas" />
    );
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-border-hairline pb-5">
        <h2 className="text-xl font-semibold text-text-primary">
          Console d’administration
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Statistiques globales de génération, gestion des modèles et liste des comptes inscrits.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-full border border-border-hairline bg-surface-canvas p-5">
          <div className="text-xs font-medium text-text-muted">Utilisateurs inscrits</div>
          <div className="mt-2 font-mono text-2xl font-bold text-text-primary tabular-nums">
            {data.stats.totalUsers}
          </div>
        </div>
        <div className="rounded-full border border-border-hairline bg-surface-canvas p-5">
          <div className="text-xs font-medium text-text-muted">Chartes créées</div>
          <div className="mt-2 font-mono text-2xl font-bold text-text-primary tabular-nums">
            {data.stats.totalBrands}
          </div>
        </div>
        <div className="rounded-full border border-border-hairline bg-surface-canvas p-5">
          <div className="text-xs font-medium text-text-muted">Éditions finalisées</div>
          <div className="mt-2 font-mono text-2xl font-bold text-text-primary tabular-nums">
            {data.stats.generatedGuidelines}
          </div>
        </div>
      </div>

      <div className="rounded-full border border-border-hairline bg-surface-canvas p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">
            Modèles de mise en page activés
          </h3>
          {saving && <span className="text-xs text-text-muted">Enregistrement…</span>}
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          {['classic', 'editorial', 'minimal'].map((tpl) => {
            const active = (data.config.enabledTemplates ?? ['classic', 'editorial', 'minimal']).includes(tpl);
            return (
              <button
                key={tpl}
                type="button"
                onClick={() => void toggleTemplate(tpl)}
                className={`rounded-full border px-4 py-2 text-xs font-medium capitalize ${
                  active
                    ? 'border-violet bg-violet text-white'
                    : 'border-border-hairline bg-surface-canvas text-text-secondary'
                }`}
              >
                {tpl}
              </button>
            );
          })}
        </div>
      </div>

      <div className="overflow-x-auto rounded-full border border-border-hairline bg-surface-canvas">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border-hairline bg-surface-subtle text-xs text-text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">E-mail</th>
              <th className="px-4 py-3 font-medium">Rôle</th>
              <th className="px-4 py-3 font-medium">Offre</th>
              <th className="px-4 py-3 font-medium">Inscription</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {data.users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 font-medium text-text-primary">{u.email}</td>
                <td className="px-4 py-3 text-xs text-text-secondary">{u.role}</td>
                <td className="px-4 py-3 font-mono text-xs text-text-secondary">{u.plan}</td>
                <td className="px-4 py-3 font-mono text-xs text-text-muted tabular-nums">
                  {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
