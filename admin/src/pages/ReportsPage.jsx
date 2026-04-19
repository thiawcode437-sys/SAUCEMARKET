import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminAPI } from '../lib/api';
import { formatDateTime } from '../lib/utils';
import DataTable from '../components/DataTable';

export default function ReportsPage() {
  const [status, setStatus] = useState('OPEN');
  const { data, isLoading } = useQuery({
    queryKey: ['adminReports', status],
    queryFn: () => AdminAPI.reports({ status }),
  });

  const columns = [
    { key: 'createdAt', label: 'Date', render: (r) => formatDateTime(r.createdAt) },
    { key: 'reporter', label: 'Signalé par', render: (r) => r.reporter?.name || '—' },
    { key: 'targetType', label: 'Type', render: (r) => (
      <span className="badge badge-gray">{r.targetType}</span>
    )},
    { key: 'targetId', label: 'Cible', render: (r) => (
      <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">{r.targetId}</code>
    )},
    { key: 'reason', label: 'Raison' },
    { key: 'details', label: 'Détails', render: (r) => (
      <div className="max-w-xs truncate text-slate-600" title={r.details}>{r.details || '—'}</div>
    )},
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Signalements</h1>

      <div className="flex gap-2 mb-4">
        {[
          { key: 'OPEN', label: 'Ouverts' },
          { key: 'REVIEWING', label: 'En cours' },
          { key: 'CLOSED', label: 'Fermés' },
          { key: 'ACTIONED', label: 'Action prise' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setStatus(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              status === t.key
                ? 'bg-primary text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <DataTable columns={columns} rows={data?.items || []} loading={isLoading} emptyText="Pas de signalement" />
    </div>
  );
}
