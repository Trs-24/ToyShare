'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

import { useTranslation } from '@/context/LanguageContext';
import type { AdminStats as Stats } from '@/lib/types';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const statCards = [
    {
      key: 'totalUsers',
      label: t('admin_users'),
      icon: '👥',
      color: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
    },
    {
      key: 'totalItems',
      label: t('admin_items'),
      icon: '🧸',
      color: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
    },
    {
      key: 'activeExchanges',
      label: t('admin_activeExchanges'),
      icon: '🔄',
      color: 'from-amber-500 to-amber-600',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
    },
    {
      key: 'completedExchanges',
      label: t('admin_completedExchanges'),
      icon: '✅',
      color: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
    },
  ];

  useEffect(() => {
    api.admin
      .getStats()
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('admin_dashboard')}</h1>
        <p className="text-gray-500 mt-1">{t('admin_statsTitle')}</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {statCards.map((card) => (
            <div
              key={card.key}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center text-2xl`}
                >
                  {card.icon}
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${card.bg} ${card.text}`}
                >
                  Всього
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats?.[card.key as keyof Stats] ?? 0}
              </div>
              <div className="text-sm text-gray-500">{card.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
