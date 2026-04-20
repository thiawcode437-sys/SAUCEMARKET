import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, ArrowUpRight, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { ProductAPI } from '../lib/api';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';

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
      {/* === HERO — split asymétrique === */}
      <section className="max-w-8xl mx-auto px-5 pt-10 md:pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
          {/* Gauche : headline */}
          <div className="md:col-span-7 animate-fade-up">
            <div className="inline-flex items-center gap-2 h-7 px-3 rounded-full bg-primary-light text-primary-dark text-[11px] font-semibold uppercase tracking-wider mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Marketplace #1 au Sénégal
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-[0.95] text-ink">
              Achète, vends,<br />
              <span className="text-ink-muted">en toute confiance.</span>
            </h1>
            <p className="mt-6 text-lg text-ink-muted max-w-[52ch] leading-relaxed">
              Le marché de tout un pays, dans ta poche. Paiements Wave, Orange Money,
              Free Money — rapides, sécurisés, locaux.
            </p>

            <form onSubmit={onSearch} className="mt-8 flex items-center gap-2 max-w-lg">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" />
                <input
                  className="input h-12 pl-11 pr-4 text-base rounded-full"
                  placeholder="Un iPhone, un boubou, une voiture…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-primary h-12 px-6">
                Chercher
                <ArrowUpRight size={16} strokeWidth={2.5} />
              </button>
            </form>

            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-ink-muted">
              <span className="flex items-center gap-2"><ShieldCheck size={16} strokeWidth={2} className="text-primary" /> Vendeurs vérifiés</span>
              <span className="flex items-center gap-2"><Zap size={16} strokeWidth={2} className="text-primary" /> Livraison rapide</span>
              <span className="flex items-center gap-2"><Sparkles size={16} strokeWidth={2} className="text-primary" /> 0% commission cachée</span>
            </div>
          </div>

          {/* Droite : preview produits (asymétrique) */}
          <div className="md:col-span-5 animate-fade-up" style={{ animationDelay: '120ms' }}>
            <div className="relative">
              <div className="grid grid-cols-2 gap-3 rotate-[1.5deg] origin-bottom-right">
                {products.slice(0, 4).map((p, i) => (
                  <div
                    key={p.id}
                    className={`aspect-[4/5] rounded-2xl overflow-hidden border border-neutral-200 shadow-sm
                                ${i === 0 ? 'translate-y-6' : ''}
                                ${i === 3 ? 'translate-y-6' : ''}`}
                  >
                    {p.images?.[0]?.url ? (
                      <img src={p.images[0].url} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-neutral-100" />
                    )}
                  </div>
                ))}
                {products.length === 0 && Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="aspect-[4/5] skeleton" />
                ))}
              </div>
              <div className="absolute -bottom-4 -left-4 surface px-4 py-2.5 shadow-lg rounded-full text-xs font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="font-mono">{products.length}</span> produits en ligne
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === Barre catégories === */}
      <section className="max-w-8xl mx-auto px-5 border-t border-neutral-200 pt-6 pb-8 sticky top-16 bg-white/80 backdrop-blur-xl z-30">
        <div className="flex gap-2 overflow-x-auto -mx-5 px-5 scrollbar-hide">
          <span
            onClick={() => setCategory('')}
            className={`chip ${!category ? 'chip-active' : ''}`}
          >
            Tout voir
          </span>
          {catsQuery.data?.items?.map((c) => (
            <span
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`chip ${category === c.id ? 'chip-active' : ''}`}
            >
              {c.name}
            </span>
          ))}
        </div>
      </section>

      {/* === Promotions === */}
      {promoted.length > 0 && (
        <section className="max-w-8xl mx-auto px-5 pt-10 pb-2">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-accent">En vedette</p>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1">Boostés cette semaine</h2>
            </div>
            <span className="text-sm text-ink-muted font-mono">{promoted.length} produits</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-8">
            {promoted.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* === Catalogue principal === */}
      <section className="max-w-8xl mx-auto px-5 py-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-muted">Catalogue</p>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1">
              {q ? `Résultats pour "${q}"` : category ? 'Dans cette catégorie' : 'Tout le catalogue'}
            </h2>
          </div>
          <span className="text-sm text-ink-muted font-mono">{regular.length} produits</span>
        </div>

        {productsQuery.isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-8">
            {Array.from({ length: 10 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : regular.length === 0 ? (
          <div className="text-center py-20 border-t border-dashed border-neutral-200">
            <p className="text-4xl font-extrabold tracking-tighter text-ink-faint">Rien trouvé.</p>
            <p className="mt-3 text-ink-muted max-w-md mx-auto">
              Aucun produit ne correspond à ta recherche. Essaye d'autres mots-clés ou reviens bientôt.
            </p>
            <button onClick={() => { setQ(''); setCategory(''); }} className="btn-outline mt-6">
              Tout réinitialiser
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-8">
            {regular.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </>
  );
}
