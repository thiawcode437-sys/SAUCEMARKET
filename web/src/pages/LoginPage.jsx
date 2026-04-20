import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useAuth } from '../store/authStore';

export default function LoginPage() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') || '/';
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      await login(email, password);
      nav(next);
    } catch (e) {
      setErr(e.response?.data?.error?.message || 'Identifiants invalides');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] grid place-items-center p-4">
      <div className="card w-full max-w-md p-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <ShoppingBag size={28} className="text-primary" />
          <span className="text-xl font-bold">Sauce Market</span>
        </div>
        <p className="text-center text-slate-500 mb-6">Connecte-toi</p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Email</label>
            <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Mot de passe</label>
            <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          {err && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{err}</div>}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-6">
          Pas encore de compte ? <Link to="/register" className="text-primary font-semibold">S'inscrire</Link>
        </p>
      </div>
    </div>
  );
}
