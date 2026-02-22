'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useTranslation } from '@/context/LanguageContext';
import { getStatusColor } from '@/lib/utils';
import { Exchange } from '@/lib/types';

export default function AdminExchangesPage() {
  const { t } = useTranslation();
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    api.admin
      .getExchanges()
      .then((data) => {
        setExchanges(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = statusFilter ? exchanges.filter((e) => e.status === statusFilter) : exchanges;

  const statusLabels: Record<string, string> = {
    PROPOSED: t('status_PROPOSED'),
    ACCEPTED: t('status_ACCEPTED'),
    IN_PROGRESS: t('status_IN_PROGRESS'),
    REJECTED: t('status_REJECTED'),
    COMPLETED: t('status_COMPLETED'),
    CANCELLED: t('status_CANCELLED'),
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('admin_exchanges')}</h1>
        <p className="text-gray-500 mt-1">All exchanges management</p>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field max-w-xs"
        >
          <option value="">{t('exchanges_filterAll')}</option>
          <option value="PROPOSED">{t('status_PROPOSED')}</option>
          <option value="ACCEPTED">{t('status_ACCEPTED')}</option>
          <option value="IN_PROGRESS">{t('status_IN_PROGRESS')}</option>
          <option value="COMPLETED">{t('status_COMPLETED')}</option>
          <option value="REJECTED">{t('status_REJECTED')}</option>
          <option value="CANCELLED">{t('status_CANCELLED')}</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t('admin_colInitiator')}
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t('admin_colReceiver')}
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t('admin_colItem1')}
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t('admin_colItem2')}
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t('admin_colStatus')}
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t('admin_colDate')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((exchange) => (
                  <tr
                    key={exchange.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono text-gray-400">
                        {exchange.id.slice(0, 8)}...
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {exchange.initiator?.name || '—'}
                      </div>
                      <div className="text-xs text-gray-400">{exchange.initiator?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {exchange.receiver?.name || '—'}
                      </div>
                      <div className="text-xs text-gray-400">{exchange.receiver?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {exchange.itemOffered?.title || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {exchange.itemRequested?.title || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(exchange.status)}`}
                      >
                        {statusLabels[exchange.status] || exchange.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(exchange.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                      {t('catalog_nothingFound')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
