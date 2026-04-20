import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { MapPin, Eye, CheckCircle, Star, MessageCircle, ShoppingCart, ArrowLeft } from 'lucide-react';
import { ProductAPI, MessageAPI } from '../lib/api';
import { formatFCFA, timeAgo } from '../lib/utils';
import { useAuth } from '../store/authStore';

export default function ProductPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [activeImg, setActiveImg] = useState(0);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => ProductAPI.detail(id),
  });

  const openChat = useMutation({
    mutationFn: () => MessageAPI.openConv(id),
    onSuccess: () => alert('Conversation ouverte ! Retrouve-la dans l\'app mobile.'),
    onError: (e) => alert(e.response?.data?.error?.message || 'Erreur'),
  });

  if (isLoading) return <div className="max-w-6xl mx-auto p-8 text-slate-500">Chargement…</div>;
  if (!product) return <div className="max-w-6xl mx-auto p-8">Produit introuvable</div>;

  const images = product.images || [];
  const mainImg = images[activeImg]?.url;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <button onClick={() => nav(-1)} className="btn-ghost mb-4 flex items-center gap-1">
        <ArrowLeft size={16} /> Retour
      </button>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="card aspect-square mb-3">
            {mainImg ? (
              <img src={mainImg} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-slate-100 grid place-items-center text-slate-400">Pas d'image</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImg(i)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 shrink-0 ${i === activeImg ? 'border-primary' : 'border-transparent'}`}
                >
                  <img src={img.url} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{product.title}</h1>
          <p className="text-3xl font-extrabold text-primary mt-2">{formatFCFA(product.price)}</p>

          <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-600">
            <span className="flex items-center gap-1"><MapPin size={16} />{product.city}</span>
            <span className="flex items-center gap-1"><Eye size={16} />{product.views} vues</span>
            <span>·</span>
            <span>{timeAgo(product.createdAt)}</span>
          </div>

          <div className="mt-6">
            <h2 className="font-semibold mb-2">Description</h2>
            <p className="text-slate-700 whitespace-pre-line">{product.description}</p>
          </div>

          <div className="mt-6 card p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary text-white grid place-items-center font-bold">
              {product.seller?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1 font-semibold">
                {product.seller?.name}
                {product.seller?.isVerified && <CheckCircle size={16} className="text-primary" />}
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1">
                {product.seller?.ratingAvg > 0 && (
                  <>
                    <Star size={12} className="text-accent fill-accent" />
                    {product.seller.ratingAvg.toFixed(1)} · {product.seller.ratingCount} avis
                  </>
                )}
                {product.seller?.ratingCount === 0 && 'Nouveau vendeur'}
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => user ? openChat.mutate() : nav('/login?next=/produit/' + id)}
              className="btn-secondary flex-1 flex items-center justify-center gap-2"
            >
              <MessageCircle size={18} /> Contacter
            </button>
            <button
              onClick={() => user ? alert('Achat — fonctionnalité bientôt disponible') : nav('/login?next=/produit/' + id)}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <ShoppingCart size={18} /> Acheter
            </button>
          </div>

          {!user && (
            <p className="text-center text-xs text-slate-500 mt-3">
              <Link to="/login" className="text-primary underline">Connecte-toi</Link> pour contacter le vendeur
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
