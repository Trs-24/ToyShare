'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import type { Exchange } from '@/lib/types';
import { getStatusColor, getDateLocale } from '@/lib/utils';
import OptimizedImage from '@/components/ui/OptimizedImage';

const STATUSES = [
  'ALL',
  'PROPOSED',
  'ACCEPTED',
  'IN_PROGRESS',
  'COMPLETED',
  'REJECTED',
  'CANCELLED',
];

export default function ExchangesTab() {
  const { t, locale } = useTranslation();
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const profile = await api.users.getProfile();
      setUserId(profile.id);
      const data = await api.exchanges.list();
      setExchanges(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredExchanges =
    statusFilter === 'ALL' ? exchanges : exchanges.filter((e) => e.status === statusFilter);

  const incoming = filteredExchanges.filter((e) => e.receiverId === userId);
  const outgoing = filteredExchanges.filter((e) => e.initiatorId === userId);

  const statusLabel = (status: string) => {
    if (status === 'ALL') return t('exchanges_filterAll' as any);
    const key = `status_${status}` as any;
    return t(key) || status;
  };

  const dateLocale = getDateLocale(locale);

  const StarDisplay = ({ rating }: { rating: number }) => (
    <span className="inline-flex items-center gap-0.5 text-amber-500 text-xs">
      {'★'.repeat(Math.round(rating))}
      {'☆'.repeat(5 - Math.round(rating))}
      <span className="text-gray-500 ml-1">{rating.toFixed(1)}</span>
    </span>
  );

  const ExchangeCard = ({ exchange }: { exchange: any }) => {
    const isIncoming = exchange.receiverId === userId;
    const otherUser = isIncoming ? exchange.initiator : exchange.receiver;
    const item = isIncoming ? exchange.itemRequested : exchange.itemOffered;
    const otherItem = isIncoming ? exchange.itemOffered : exchange.itemRequested;

    return (
      <Link href={`/exchanges/${exchange.id}`} className="block">
        <div className="bg-white dark:bg-slate-900/80 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(exchange.status)}`}
              >
                {statusLabel(exchange.status)}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {new Date(exchange.createdAt).toLocaleDateString(dateLocale)}
              </span>
            </div>
            {isIncoming && exchange.status === 'PROPOSED' && (
              <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                {isIncoming ? t('exchanges_from') : t('exchanges_to')}{' '}
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {otherUser.name}
                </span>
                {otherUser.rating > 0 && (
                  <span className="ml-2">
                    <StarDisplay rating={otherUser.rating} />
                  </span>
                )}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-800 relative">
                  <OptimizedImage
                    src={item?.photos?.[0]?.url || ''}
                    alt=""
                    className="object-cover"
                    sizes="40px"
                    fallback="🧸"
                  />
                </div>
                <span className="text-gray-400 dark:text-gray-500">⇄</span>
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-800 relative">
                  <OptimizedImage
                    src={otherItem?.photos?.[0]?.url || ''}
                    alt=""
                    className="object-cover"
                    sizes="40px"
                    fallback="🧸"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  if (loading)
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
      </div>
    );

  return (
    <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 md:p-8">
      {/* Status Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              statusFilter === s
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
            }`}
          >
            {statusLabel(s)}
            {s !== 'ALL' && (
              <span className="ml-1 opacity-70">
                ({exchanges.filter((e) => e.status === s).length})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
            {t('exchanges_incoming')}
          </h2>
          <div className="space-y-3">
            {incoming.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                {t('exchanges_noIncoming')}
              </p>
            ) : (
              incoming.map((e) => <ExchangeCard key={e.id} exchange={e} />)
            )}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
            {t('exchanges_outgoing')}
          </h2>
          <div className="space-y-3">
            {outgoing.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                {t('exchanges_noOutgoing')}
              </p>
            ) : (
              outgoing.map((e) => <ExchangeCard key={e.id} exchange={e} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
