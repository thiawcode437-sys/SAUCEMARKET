import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Package, CreditCard, Flag, Settings, LogOut, ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../store/authStore';

const NAV = [
  { to: '/',              icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/users',         icon: Users,           label: 'Utilisateurs' },
  { to: '/products',      icon: Package,         label: 'Modération produits' },
  { to: '/subscriptions', icon: CreditCard,      label: 'Abonnements' },
  { to: '/reports',       icon: Flag,            label: 'Signalements' },
  { to: '/config',        icon: Settings,        label: 'Configuration' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="px-6 py-5 flex items-center gap-2 border-b border-slate-100">
          <ShoppingBag className="text-primary" size={24} />
          <div>
            <div className="font-bold">Sauce Market</div>
            <div className="text-xs text-slate-500">Admin</div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  isActive
                    ? 'bg-primary-light text-primary-dark font-semibold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`
              }
              end={item.to === '/'}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-100">
          <div className="px-3 py-2 text-sm">
            <div className="font-semibold">{user?.name}</div>
            <div className="text-xs text-slate-500">{user?.email || user?.phone}</div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut size={18} /> Se déconnecter
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
