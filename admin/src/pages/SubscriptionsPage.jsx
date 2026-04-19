import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminAPI } from '../lib/api';
import { formatFCFA, formatDate } from '../lib/utils';
import DataTable from '../components/DataTable';

export default function SubscriptionsPage() {
  const [status, setStatus] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['adminSubs', status],
    queryFn: () => AdminAPI.subscriptions({ status: status || undefined }),
  });

  const statusBadge = (s) => {
    const map = {
      ACTIVE: 'badge-green',
      PENDING: 'badge-amber',
      CANCELED: 'badge-gray',
      EXPIRED: 'badge-gray',
      FAILED: 'badge-red',
    };
    return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>;
  };

  const columns = [
    { key: 'user', label: 'Vendeur', render: (s) => (
      <div>
        <div className="font-semibold">{s.user?.name}</div>
        <div className="text-xs text-slate-500">{s.user?.phone}</div>
      </div>
    )},
    { key: 'plan', label: 'Plan' },
    { key: 'amount', label: 'Montant', render: (s) => formatFCFA(s.amount) },
    { key: 'provider', label: 'Opérateur' },
    { key: 'status', label: 'Statut', render: (s) => statusBadge(s.status) },
    { key: 'startsAt', label: 'Début', render: (s) => formatDate(s.startsAt) },
    { key: 'endsAt', label: 'Fin', render: (s) => formatDate(s.endsAt) },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Abonnements</h1>

      <div className="mb-4">
        <select className="input w-48" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Tous</option>
          <option value="ACTIVE">Actifs</option>
          <option value="PENDING">En attente</option>
          <option value="CANCELED">Annulés</option>
          <option value="EXPIRED">Expirés</option>
          <option value="FAILED">Échoués</option>
        </select>
      </div>

      <DataTable columns={columns} rows={data?.items || []} loading={isLoading} />
    </div>
  );
}
