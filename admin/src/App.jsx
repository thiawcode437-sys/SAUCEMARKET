import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './store/authStore';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import ProductsModerationPage from './pages/ProductsModerationPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import ReportsPage from './pages/ReportsPage';
import ConfigPage from './pages/ConfigPage';

export default function App() {
  const { user, loading, init } = useAuth();
  useEffect(() => { init(); }, [init]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-slate-500">
        Chargement…
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/products" element={<ProductsModerationPage />} />
        <Route path="/subscriptions" element={<SubscriptionsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/config" element={<ConfigPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
