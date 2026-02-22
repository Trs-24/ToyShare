'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useTranslation } from '@/context/LanguageContext';
import { getMediaUrl, getStatusColor, getDateLocale } from '@/lib/utils';
import { Exchange } from '@/lib/types';

const STATUSES = [
  'ALL',
  'PROPOSED',
  'ACCEPTED',
  'IN_PROGRESS',
  'COMPLETED',
  'REJECTED',
  'CANCELLED',
];

export default function ExchangesPage() {
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
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(exchange.status)}`}
              >
                {statusLabel(exchange.status)}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(exchange.createdAt).toLocaleDateString(dateLocale)}
              </span>
            </div>
            {isIncoming && exchange.status === 'PROPOSED' && (
              <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">
                {isIncoming ? t('exchanges_from') : t('exchanges_to')}{' '}
                <span className="font-medium text-gray-900">{otherUser.name}</span>
                {otherUser.rating > 0 && (
                  <span className="ml-2">
                    <StarDisplay rating={otherUser.rating} />
                  </span>
                )}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <img
                  src={
                    item?.photos?.[0]?.url ? getMediaUrl(item.photos[0].url) : '/placeholder.png'
                  }
                  className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                />
                <span className="text-gray-400">⇄</span>
                <img
                  src={
                    otherItem?.photos?.[0]?.url
                      ? getMediaUrl(otherItem.photos[0].url)
                      : '/placeholder.png'
                  }
                  className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                />
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  if (loading)
    return (
      <>
        <Navbar />
        <div className="p-8 text-center text-gray-500">{t('loading')}</div>
      </>
    );

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto p-6">
        {/* Back Link */}
        <Link
          href="/catalog"
          className="inline-flex items-center text-gray-500 hover:text-gray-700 font-medium mb-6 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          {t('item_backToCatalog') || 'Назад к каталогу'}
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('exchanges_title')}</h1>

        {/* Status Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === s
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              {t('exchanges_incoming')}
            </h2>
            <div className="space-y-3">
              {incoming.length === 0 ? (
                <p className="text-sm text-gray-400 italic">{t('exchanges_noIncoming')}</p>
              ) : (
                incoming.map((e) => <ExchangeCard key={e.id} exchange={e} />)
              )}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              {t('exchanges_outgoing')}
            </h2>
            <div className="space-y-3">
              {outgoing.length === 0 ? (
                <p className="text-sm text-gray-400 italic">{t('exchanges_noOutgoing')}</p>
              ) : (
                outgoing.map((e) => <ExchangeCard key={e.id} exchange={e} />)
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
