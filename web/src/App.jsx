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
      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-slate-500 text-center">
          © 2026 Sauce Market · Marketplace du Sénégal 🇸🇳
        </div>
      </footer>
    </>
  );
}
