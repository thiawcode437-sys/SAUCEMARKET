import { Link, NavLink } from 'react-router-dom';
import { LogOut, Plus, Search } from 'lucide-react';
import { useAuth } from '../store/authStore';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-neutral-200">
      <div className="max-w-8xl mx-auto px-5 h-16 flex items-center gap-6">
        <Link to="/" className="flex items-baseline gap-1.5 shrink-0">
          <span className="text-xl font-extrabold tracking-tighter text-ink">Sauce</span>
          <span className="text-xl font-light tracking-tighter text-ink-muted">/market</span>
          <span className="hidden md:inline w-1.5 h-1.5 rounded-full bg-primary ml-1" />
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-sm">
          <NavLink to="/" end className={({ isActive }) =>
            `px-3 h-9 rounded-full flex items-center font-medium transition ${isActive ? 'text-ink' : 'text-ink-muted hover:text-ink'}`
          }>
            Explorer
          </NavLink>
          <NavLink to="/?category=tech" className={({ isActive }) =>
            `px-3 h-9 rounded-full flex items-center font-medium transition ${isActive ? 'text-ink' : 'text-ink-muted hover:text-ink'}`
          }>
            Catégories
          </NavLink>
          <a href="#" className="px-3 h-9 rounded-full flex items-center font-medium text-ink-muted hover:text-ink transition">
            Vendeurs
          </a>
        </nav>

        <div className="flex-1" />

        {user ? (
          <div className="flex items-center gap-2">
            <Link to="/publier" className="btn-accent">
              <Plus size={16} strokeWidth={2.5} />
              <span className="hidden sm:inline">Publier</span>
            </Link>
            <Link to="/profile" className="flex items-center gap-2 pl-1 pr-3 h-10 rounded-full hover:bg-neutral-100 transition">
              <div className="w-8 h-8 rounded-full bg-ink text-white grid place-items-center text-sm font-semibold">
                {user.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="hidden lg:inline text-sm font-medium text-ink">{user.name}</span>
            </Link>
            <button onClick={logout} className="btn-ghost" title="Se déconnecter">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/publier" className="btn-accent">
              <Plus size={16} strokeWidth={2.5} />
              <span className="hidden sm:inline">Publier</span>
            </Link>
            <Link to="/login" className="btn-outline hidden sm:inline-flex">Se connecter</Link>
          </div>
        )}
      </div>
    </header>
  );
}
