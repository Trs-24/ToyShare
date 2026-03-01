import { memo } from 'react';
import Link from 'next/link';
import {
  getConditionLabel,
  getCategoryLabel,
  getAgeLabel,
  getTypeLabel,
} from '@/constants/itemOptions';
import OptimizedImage from '@/components/ui/OptimizedImage';
import type { Item } from '@/lib/types';
import type { TranslationKeys } from '@/i18n';

type TFn = (key: TranslationKeys) => string;

interface ItemCardProps {
  item: Item;
  t: TFn;
  /** Extra CSS classes for the outer Link wrapper */
  className?: string;
}

/**
 * Reusable item card used in catalog grid, similar items, and profile items.
 * Renders photo with badges, title, description, and metadata tags.
 */
const ItemCard = memo(function ItemCard({ item, t, className = '' }: ItemCardProps) {
  const isInExchange = ['ACCEPTED', 'IN_PROGRESS'].includes(item.exchangeStatus || '');

  return (
    <Link
      href={`/items/${item.id}`}
      className={`card group hover:shadow-lg transition-shadow block ${className}`}
    >
      {/* Photo */}
      <div className="aspect-square bg-gray-100 dark:bg-slate-800 relative overflow-hidden rounded-t-xl">
        {item.photos?.[0] ? (
          <OptimizedImage
            src={item.photos[0].url}
            alt={item.title}
            className={`object-cover group-hover:scale-105 transition duration-300 ${isInExchange ? 'opacity-60' : ''}`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🧸</div>
        )}

        {/* Top-right badges */}
        <div className="absolute top-2 right-2 flex gap-1">
          {item.condition && (
            <span className="badge bg-white/90 dark:bg-slate-800/90 text-gray-700 dark:text-gray-200 shadow-sm text-xs">
              {getConditionLabel(t, item.condition)}
            </span>
          )}
        </div>

        {/* Top-left badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          {item.type && (
            <span className="badge bg-teal-500/90 text-white shadow-sm text-xs">
              {getTypeLabel(t, item.type)}
            </span>
          )}
          {isInExchange && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/90 text-white text-xs font-medium shadow">
              ⇄ {t('dash_inExchange')}
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 dark:text-gray-100 line-clamp-1 mb-1">
          {item.title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
          {item.description}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {item.category && (
            <span className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-[11px] font-medium">
              {getCategoryLabel(t, item.category)}
            </span>
          )}
          {item.age && (
            <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-[11px] font-medium">
              {getAgeLabel(t, item.age)}
            </span>
          )}
        </div>

        {/* Location */}
        {item.owner?.city && (
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-3">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {item.owner.city}
          </div>
        )}
      </div>
    </Link>
  );
});

export default ItemCard;
