import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { ProductAPI } from '../lib/api';
import ProductCard from '../components/ProductCard';

export default function HomePage() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const category = params.get('category') || '';

  const catsQuery = useQuery({ queryKey: ['categories'], queryFn: ProductAPI.categories });
  const productsQuery = useQuery({
    queryKey: ['products', { q, category }],
    queryFn: () => ProductAPI.list({ q: q || undefined, category: category || undefined }),
  });

  const onSearch = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(params);
    if (q) next.set('q', q); else next.delete('q');
    setParams(next);
  };

  const setCategory = (c) => {
    const next = new URLSearchParams(params);
    if (c) next.set('category', c); else next.delete('category');
    setParams(next);
  };

  const products = productsQuery.data?.items || [];
  const promoted = products.filter((p) => p.isPromoted);
  const regular = products.filter((p) => !p.isPromoted);

  return (
    <>
      <section className="bg-gradient-to-br from-primary to-primary-dark text-white">
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3">
            Achète, vends, échange au Sénégal 🇸🇳
          </h1>
          <p className="text-lg md:text-xl opacity-90 mb-6">
            La marketplace de confiance. Paiement Wave, Orange Money, Free Money.
          </p>
          <form onSubmit={onSearch} className="max-w-xl bg-white rounded-full flex items-center p-1 shadow-lg">
            <Search size={18} className="text-slate-400 ml-3" />
            <input
              className="flex-1 px-3 py-2 text-slate-900 outline-none bg-transparent"
              placeholder="Rechercher un produit…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button type="submit" className="btn-primary rounded-full">Chercher</button>
          </form>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          <span
            onClick={() => setCategory('')}
            className={`chip ${!category ? 'chip-active' : ''}`}
          >
            Tous
          </span>
          {catsQuery.data?.items?.map((c) => (
            <span
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`chip ${category === c.id ? 'chip-active' : ''}`}
            >
              <span>{c.icon}</span> {c.name}
            </span>
          ))}
        </div>
      </section>

      {promoted.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 mb-8">
          <h2 className="text-xl font-bold mb-4">🔥 Promotions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {promoted.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      <section className="max-w-6xl mx-auto px-4 pb-12">
        <h2 className="text-xl font-bold mb-4">Tous les produits</h2>
        {productsQuery.isLoading ? (
          <p className="text-slate-500">Chargement…</p>
        ) : regular.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <p className="text-lg mb-2">Aucun produit trouvé</p>
            <p className="text-sm">Essaye une autre recherche ou catégorie.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {regular.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </>
  );
}
