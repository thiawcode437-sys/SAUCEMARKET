import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Shield, ShieldOff, CheckCircle } from 'lucide-react';
import { AdminAPI } from '../lib/api';
import { formatDate } from '../lib/utils';
import DataTable from '../components/DataTable';

export default function UsersPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['adminUsers', { q, role }],
    queryFn: () => AdminAPI.users({ q, role }),
  });

  const update = useMutation({
    mutationFn: ({ id, data }) => AdminAPI.updateUser(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminUsers'] }),
  });

  const roleBadge = (r) => {
    if (r === 'ADMIN') return <span className="badge badge-red">Admin</span>;
    if (r === 'SELLER') return <span className="badge badge-green">Vendeur</span>;
    return <span className="badge badge-gray">Acheteur</span>;
  };

  const statusBadge = (s) => {
    if (s === 'ACTIVE') return <span className="badge badge-green">Actif</span>;
    if (s === 'SUSPENDED') return <span className="badge badge-amber">Suspendu</span>;
    return <span className="badge badge-red">Banni</span>;
  };

  const columns = [
    { key: 'name', label: 'Nom', render: (u) => (
      <div>
        <div className="font-semibold flex items-center gap-1">
          {u.name}
          {u.isVerified && <CheckCircle size={14} className="text-primary" />}
        </div>
        <div className="text-xs text-slate-500">{u.phone}</div>
      </div>
    )},
    { key: 'email', label: 'Email', render: (u) => u.email || '—' },
    { key: 'city', label: 'Ville' },
    { key: 'role', label: 'Rôle', render: (u) => roleBadge(u.role) },
    { key: 'status', label: 'Statut', render: (u) => statusBadge(u.status) },
    { key: 'createdAt', label: 'Inscrit le', render: (u) => formatDate(u.createdAt) },
    { key: 'actions', label: '', render: (u) => (
      <div className="flex gap-1 justify-end">
        {u.status === 'ACTIVE' ? (
          <button
            onClick={() => update.mutate({ id: u.id, data: { status: 'SUSPENDED' } })}
            className="btn-ghost text-amber-600"
            title="Suspendre"
          >
            <ShieldOff size={16} />
          </button>
        ) : (
          <button
            onClick={() => update.mutate({ id: u.id, data: { status: 'ACTIVE' } })}
            className="btn-ghost text-green-600"
            title="Réactiver"
          >
            <Shield size={16} />
          </button>
        )}
        {!u.isVerified && (
          <button
            onClick={() => update.mutate({ id: u.id, data: { isVerified: true } })}
            className="btn-ghost text-primary"
            title="Vérifier"
          >
            <CheckCircle size={16} />
          </button>
        )}
      </div>
    )},
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Utilisateurs</h1>

      <div className="flex gap-3 mb-4">
        <div className="flex items-center gap-2 flex-1 bg-white rounded-lg border border-slate-200 px-3">
          <Search size={16} className="text-slate-400" />
          <input
            className="flex-1 py-2 outline-none"
            placeholder="Rechercher nom, téléphone, email…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select
          className="input w-48"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">Tous les rôles</option>
          <option value="BUYER">Acheteurs</option>
          <option value="SELLER">Vendeurs</option>
          <option value="ADMIN">Admins</option>
        </select>
      </div>

      <DataTable columns={columns} rows={data?.items || []} loading={isLoading} />
    </div>
  );
}
