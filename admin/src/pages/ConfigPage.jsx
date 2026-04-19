import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Save } from 'lucide-react';
import { AdminAPI } from '../lib/api';

export default function ConfigPage() {
  const [commission, setCommission] = useState('0.05');
  const [subPrice, setSubPrice] = useState('1000');
  const [promoPrice, setPromoPrice] = useState('500');
  const [msg, setMsg] = useState('');

  const save = useMutation({
    mutationFn: ({ key, value }) => AdminAPI.updateConfig(key, value),
    onSuccess: () => setMsg('✓ Enregistré'),
    onError: (e) => setMsg('Erreur : ' + (e.response?.data?.error?.message || e.message)),
  });

  const submit = async () => {
    setMsg('');
    await save.mutateAsync({ key: 'COMMISSION_RATE', value: commission });
    await save.mutateAsync({ key: 'SUBSCRIPTION_MONTHLY_FCFA', value: subPrice });
    await save.mutateAsync({ key: 'PROMO_7D_FCFA', value: promoPrice });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Configuration</h1>
      <p className="text-slate-500 mb-6">Règles métier éditables sans redéploiement.</p>

      <div className="card max-w-xl space-y-4">
        <Field
          label="Taux de commission"
          hint="Ex : 0.05 = 5%"
          value={commission}
          onChange={setCommission}
        />
        <Field
          label="Prix abonnement mensuel (FCFA)"
          value={subPrice}
          onChange={setSubPrice}
        />
        <Field
          label="Prix boost 7 jours (FCFA)"
          value={promoPrice}
          onChange={setPromoPrice}
        />

        <button onClick={submit} className="btn-primary flex items-center gap-2">
          <Save size={16} /> Enregistrer
        </button>

        {msg && <div className="text-sm text-slate-600">{msg}</div>}
      </div>
    </div>
  );
}

function Field({ label, hint, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1">{label}</label>
      <input className="input" value={value} onChange={(e) => onChange(e.target.value)} />
      {hint && <div className="text-xs text-slate-500 mt-1">{hint}</div>}
    </div>
  );
}
