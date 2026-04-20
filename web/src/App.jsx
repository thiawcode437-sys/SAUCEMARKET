import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import PublishPage from './pages/PublishPage';
import { useAuth } from './store/authStore';

export default function App() {
  const init = useAuth((s) => s.init);
  useEffect(() => { init(); }, [init]);

  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/produit/:id" element={<ProductPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/publier" element={<PublishPage />} />
          <Route path="*" element={<div className="max-w-6xl mx-auto p-8 text-center">Page introuvable</div>} />
        </Routes>
      </main>
      <footer className="border-t border-neutral-200 bg-white mt-20">
        <div className="max-w-8xl mx-auto px-5 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-baseline gap-1.5 mb-3">
              <span className="text-xl font-extrabold tracking-tighter">Sauce</span>
              <span className="text-xl font-light tracking-tighter text-ink-muted">/market</span>
            </div>
            <p className="text-ink-muted max-w-xs leading-relaxed">
              La marketplace de confiance, construite au Sénégal pour le Sénégal.
            </p>
          </div>
          <div>
            <p className="font-semibold mb-3">Explorer</p>
            <ul className="space-y-2 text-ink-muted">
              <li><a href="/" className="hover:text-ink">Tout voir</a></li>
              <li><a href="/publier" className="hover:text-ink">Publier une annonce</a></li>
              <li><a href="/register" className="hover:text-ink">Devenir vendeur</a></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-3">Paiements</p>
            <ul className="space-y-2 text-ink-muted">
              <li>Wave</li>
              <li>Orange Money</li>
              <li>Free Money</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-3">Support</p>
            <ul className="space-y-2 text-ink-muted">
              <li>Aide</li>
              <li>Contact</li>
              <li>Conditions</li>
            </ul>
          </div>
        </div>
        <div className="divider">
          <div className="max-w-8xl mx-auto px-5 py-5 flex items-center justify-between text-xs text-ink-faint">
            <span>© 2026 Sauce Market</span>
            <span className="font-mono">Dakar · Sénégal</span>
          </div>
        </div>
      </footer>
    </>
  );
}
