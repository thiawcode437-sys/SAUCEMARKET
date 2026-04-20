import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, CheckCircle, Smartphone } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../store/authStore';

export default function ProfilePage() {
  const { user } = useAuth();

  const subQuery = useQuery({
    queryKey: ['mySub'],
    queryFn: () => api.get('/subscriptions/me').then((r) => r.data),
    enabled: !!user,
  });

  if (!user) return <div className="max-w-2xl mx-auto p-8">Connecte-toi pour voir ton profil.</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="card p-6 flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-primary text-white grid place-items-center text-2xl font-bold">
          {user.name?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {user.name}
            {user.isVerified && <CheckCircle size={20} className="text-primary" />}
          </h1>
          <div className="text-sm text-slate-500 flex flex-wrap gap-3 mt-1">
            <span className="flex items-center gap-1"><Phone size={14} />{user.phone}</span>
            {user.email && <span className="flex items-center gap-1"><Mail size={14} />{user.email}</span>}
            {user.city && <span className="flex items-center gap-1"><MapPin size={14} />{user.city}</span>}
          </div>
        </div>
      </div>

      <div className="card p-6 mt-4">
        <h2 className="font-bold text-lg mb-3">💼 Abonnement vendeur</h2>
        {subQuery.data?.isActive ? (
          <div>
            <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
              ✓ Actif
            </span>
            <p className="text-sm text-slate-600 mt-2">
              Expire le {new Date(subQuery.data.subscription.endsAt).toLocaleDateString('fr-FR')}
            </p>
          </div>
        ) : (
          <div>
            <p className="text-slate-600 mb-3">Tu n'es pas vendeur. Souscris à 1 000 FCFA/mois pour vendre.</p>
            <p className="text-sm text-slate-500">L'inscription vendeur se fait depuis l'app mobile pour l'instant.</p>
          </div>
        )}
      </div>

      <div className="card p-6 mt-4">
        <div className="flex items-center gap-2 mb-3">
          <Smartphone size={20} className="text-primary" />
          <h2 className="font-bold text-lg">App mobile</h2>
        </div>
        <p className="text-slate-600 text-sm mb-3">
          Pour publier, discuter et gérer tes ventes, télécharge notre app Android.
        </p>
        <button className="btn-primary opacity-50 cursor-not-allowed" disabled>Télécharger (bientôt)</button>
      </div>
    </div>
  );
}
