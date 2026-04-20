import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { AuthAPI } from '../lib/api';
import { useAuth } from '../store/authStore';

export default function RegisterPage() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '+221', email: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const setField = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!/^\+221[0-9]{9}$/.test(form.phone)) {
      return setErr('Numéro sénégalais invalide (format : +221XXXXXXXXX)');
    }
    if (form.password.length < 6) {
      return setErr('Mot de passe : 6 caractères minimum');
    }
    setLoading(true);
    try {
      await AuthAPI.register(form);
      await login(form.email, form.password);
      nav('/');
    } catch (e) {
      setErr(e.response?.data?.error?.message || 'Erreur d\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] grid place-items-center p-4 py-10">
      <div className="card w-full max-w-md p-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <ShoppingBag size={28} className="text-primary" />
          <span className="text-xl font-bold">Sauce Market</span>
        </div>
        <p className="text-center text-slate-500 mb-6">Créer un compte</p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Nom complet *</label>
            <input className="input" value={form.name} onChange={setField('name')} required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Téléphone *</label>
            <input className="input" value={form.phone} onChange={setField('phone')} placeholder="+221771234567" required />
            <p className="text-xs text-slate-500 mt-1">Format : +221 suivi de 9 chiffres</p>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Email *</label>
            <input type="email" className="input" value={form.email} onChange={setField('email')} required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Mot de passe *</label>
            <input type="password" className="input" value={form.password} onChange={setField('password')} required minLength={6} />
          </div>

          {err && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{err}</div>}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Création…' : 'Créer mon compte'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-6">
          Déjà un compte ? <Link to="/login" className="text-primary font-semibold">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
