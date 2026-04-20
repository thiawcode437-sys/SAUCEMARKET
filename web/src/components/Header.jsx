import { Link, NavLink } from 'react-router-dom';
import { ShoppingBag, User, LogOut, Search } from 'lucide-react';
import { useAuth } from '../store/authStore';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 font-extrabold text-primary shrink-0">
          <ShoppingBag size={24} />
          <span className="hidden sm:inline text-lg">Sauce Market</span>
        </Link>

        <nav className="hidden md:flex gap-1 ml-4">
          <NavLink to="/" end className={({ isActive }) =>
            `px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-primary-light text-primary-dark' : 'text-slate-600 hover:text-slate-900'}`
          }>
            Accueil
          </NavLink>
          <NavLink to="/?category=tech" className={({ isActive }) =>
            `px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-primary-light text-primary-dark' : 'text-slate-600 hover:text-slate-900'}`
          }>
            Catégories
          </NavLink>
        </nav>

        <div className="flex-1" />

        {user ? (
          <div className="flex items-center gap-2">
            <Link to="/profile" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100">
              <div className="w-8 h-8 rounded-full bg-primary text-white grid place-items-center text-sm font-bold">
                {user.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="hidden sm:inline text-sm font-medium">{user.name}</span>
            </Link>
            <button onClick={logout} className="btn-ghost text-red-600" title="Se déconnecter">
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-ghost">Se connecter</Link>
            <Link to="/register" className="btn-primary hidden sm:inline-flex">S'inscrire</Link>
          </div>
        )}
      </div>
    </header>
  );
}
