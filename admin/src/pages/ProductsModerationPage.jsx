import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X } from 'lucide-react';
import { AdminAPI } from '../lib/api';
import { formatFCFA, formatDate } from '../lib/utils';

export default function ProductsModerationPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState('PENDING_REVIEW');

  const { data, isLoading } = useQuery({
    queryKey: ['adminProducts', status],
    queryFn: () => AdminAPI.productsModeration({ status }),
  });

  const approve = useMutation({
    mutationFn: AdminAPI.approveProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminProducts'] }),
  });

  const reject = useMutation({
    mutationFn: ({ id, reason }) => AdminAPI.rejectProduct(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminProducts'] }),
  });

  const onReject = (id) => {
    const reason = prompt('Raison du rejet ?');
    if (reason) reject.mutate({ id, reason });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Modération produits</h1>
      <p className="text-slate-500 mb-6">Approuve ou rejette les annonces soumises.</p>

      <div className="flex gap-2 mb-4">
        {[
          { key: 'PENDING_REVIEW', label: 'En attente' },
          { key: 'PUBLISHED', label: 'Publiés' },
          { key: 'REJECTED', label: 'Rejetés' },
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

      {isLoading && <div className="text-slate-500">Chargement…</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(data?.items || []).map((p) => (
          <div key={p.id} className="card p-0 overflow-hidden">
            {p.images?.[0]?.url ? (
              <img src={p.images[0].url} alt={p.title} className="w-full h-48 object-cover" />
            ) : (
              <div className="w-full h-48 bg-slate-100 grid place-items-center text-slate-400">—</div>
            )}
            <div className="p-4">
              <h3 className="font-semibold line-clamp-1">{p.title}</h3>
              <p className="text-primary font-bold">{formatFCFA(p.price)}</p>
              <p className="text-xs text-slate-500 mt-1">
                {p.seller?.name} · {p.city} · {formatDate(p.createdAt)}
              </p>
              <p className="text-sm text-slate-600 mt-2 line-clamp-2">{p.description}</p>

              {status === 'PENDING_REVIEW' && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => approve.mutate(p.id)}
                    className="flex-1 flex items-center justify-center gap-1 bg-green-100 text-green-700 py-2 rounded-lg font-medium hover:bg-green-200"
                  >
                    <Check size={16} /> Approuver
                  </button>
                  <button
                    onClick={() => onReject(p.id)}
                    className="flex-1 flex items-center justify-center gap-1 bg-red-100 text-red-700 py-2 rounded-lg font-medium hover:bg-red-200"
                  >
                    <X size={16} /> Rejeter
                  </button>
                </div>
              )}
              {status === 'REJECTED' && p.rejectedReason && (
                <div className="mt-3 p-2 bg-red-50 text-red-700 text-xs rounded">
                  Motif : {p.rejectedReason}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {!isLoading && (data?.items || []).length === 0 && (
        <div className="card text-center text-slate-500">Aucun produit</div>
      )}
    </div>
  );
}
