import { Link } from 'react-router-dom';
import { MapPin, Star, Flame } from 'lucide-react';
import { formatFCFA, timeAgo } from '../lib/utils';

export default function ProductCard({ product }) {
  const img = product.images?.[0]?.url;
  return (
    <Link
      to={`/produit/${product.id}`}
      className="group block transition-transform duration-300 hover:-translate-y-0.5"
    >
      <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-100 mb-3">
        {img ? (
          <img
            src={img}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-ink-faint text-xs">Pas d'image</div>
        )}
        {product.isPromoted && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/95 backdrop-blur border border-white/40 text-[10px] font-semibold uppercase tracking-wider text-ink px-2.5 h-6 rounded-full">
            <Flame size={11} strokeWidth={2.5} className="text-accent" /> Promo
          </div>
        )}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
          <div className="flex items-center gap-1 bg-white/95 backdrop-blur text-[11px] font-medium text-ink-muted px-2.5 h-6 rounded-full">
            <MapPin size={11} strokeWidth={2} />
            {product.city}
          </div>
          {product.seller?.ratingAvg > 0 && (
            <div className="flex items-center gap-1 bg-ink/90 backdrop-blur text-[11px] font-semibold text-white px-2.5 h-6 rounded-full">
              <Star size={11} strokeWidth={2} className="fill-current" />
              {product.seller.ratingAvg.toFixed(1)}
            </div>
          )}
        </div>
      </div>

      <div className="px-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[15px] font-medium text-ink leading-tight line-clamp-2 flex-1">
            {product.title}
          </h3>
        </div>
        <div className="flex items-baseline justify-between mt-1.5">
          <p className="text-base font-semibold text-ink tracking-tight">{formatFCFA(product.price)}</p>
          <p className="text-[11px] text-ink-faint">{timeAgo(product.createdAt)}</p>
        </div>
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div>
      <div className="aspect-[4/5] skeleton mb-3" />
      <div className="h-4 skeleton w-4/5 mb-2" />
      <div className="h-4 skeleton w-2/5" />
    </div>
  );
}
