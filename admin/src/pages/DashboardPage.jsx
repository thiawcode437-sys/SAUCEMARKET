import { useQuery } from '@tanstack/react-query';
import { Users, Store, CreditCard, Package, TrendingUp, DollarSign } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { AdminAPI } from '../lib/api';
import { formatFCFA } from '../lib/utils';
import StatCard from '../components/StatCard';

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: AdminAPI.stats,
    refetchInterval: 60_000,
  });

  const chartData = [
    { name: 'MRR abos', value: data?.mrrFromSubs || 0 },
    { name: 'Commission', value: data?.monthlyCommission || 0 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tableau de bord</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users} label="Utilisateurs" value={data?.users ?? '—'} color="blue" />
        <StatCard icon={Store} label="Vendeurs" value={data?.sellers ?? '—'} color="primary" />
        <StatCard icon={CreditCard} label="Abonnements actifs" value={data?.activeSubs ?? '—'} color="amber" />
        <StatCard icon={Package} label="Produits publiés" value={data?.productsPublished ?? '—'} color="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={DollarSign}
          label="MRR (abonnements)"
          value={formatFCFA(data?.mrrFromSubs)}
          color="primary"
        />
        <StatCard
          icon={TrendingUp}
          label="GMV 30 jours"
          value={formatFCFA(data?.monthlyGMV)}
          color="blue"
        />
        <StatCard
          icon={DollarSign}
          label="Commission 30 jours"
          value={formatFCFA(data?.monthlyCommission)}
          color="amber"
        />
      </div>

      <div className="card">
        <h2 className="font-semibold mb-4">Revenus mensuels</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatFCFA(v)} />
              <Bar dataKey="value" fill="#16A34A" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {isLoading && <div className="text-slate-500 mt-4">Chargement des stats…</div>}
    </div>
  );
}
