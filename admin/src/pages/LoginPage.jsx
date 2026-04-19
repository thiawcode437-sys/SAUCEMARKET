import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useAuth } from '../store/authStore';

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('admin@saucemarket.sn');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      await login(email, password);
      nav('/');
    } catch (e) {
      setErr(e.response?.data?.error?.message || e.message || 'Échec de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-6 bg-gradient-to-br from-primary-light to-white">
      <div className="card w-full max-w-md">
        <div className="flex items-center gap-2 justify-center mb-2">
          <ShoppingBag className="text-primary" size={28} />
          <span className="text-xl font-bold">Sauce Market</span>
        </div>
        <p className="text-center text-slate-500 mb-6">Administration</p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Mot de passe</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {err && <div className="text-red-600 text-sm">{err}</div>}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}
