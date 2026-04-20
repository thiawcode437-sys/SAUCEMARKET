import { Link } from 'react-router-dom';
import { MapPin, Star, Flame } from 'lucide-react';
import { formatFCFA, timeAgo } from '../lib/utils';

export default function ProductCard({ product }) {
  const img = product.images?.[0]?.url;
  return (
    <Link to={`/produit/${product.id}`} className="card hover:shadow-md transition group">
      <div className="relative aspect-square bg-slate-100">
        {img ? (
          <img src={img} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
        ) : (
          <div className="w-full h-full grid place-items-center text-slate-400">Pas d'image</div>
        )}
        {product.isPromoted && (
          <div className="absolute top-2 left-2 bg-accent text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <Flame size={12} /> Promo
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-medium text-slate-900 line-clamp-1">{product.title}</h3>
        <p className="text-primary font-bold text-lg mt-1">{formatFCFA(product.price)}</p>
        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
          <MapPin size={12} />
          <span>{product.city}</span>
          {product.seller?.ratingAvg > 0 && (
            <>
              <span>·</span>
              <Star size={12} className="text-accent fill-accent" />
              <span>{product.seller.ratingAvg.toFixed(1)}</span>
            </>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-1">{timeAgo(product.createdAt)}</p>
      </div>
    </Link>
  );
}
