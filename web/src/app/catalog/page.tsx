'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { api } from '@/lib/api';
import { getMediaUrl } from '@/lib/utils';
import { useTranslation } from '@/context/LanguageContext';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  getCategoryOptions,
  getAgeOptions,
  getTypeOptions,
  getConditionOptions,
  getGenderOptions,
  getConditionLabel,
} from '@/constants/itemOptions';

const PER_PAGE_OPTIONS = [15, 30, 100];

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const { t } = useTranslation();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const searchParams = useSearchParams();
  const router = useRouter();

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    condition: searchParams.get('condition') || '',
    gender: searchParams.get('gender') || '',
    age: searchParams.get('age') || '',
    type: searchParams.get('type') || '',
    city: searchParams.get('city') || '',
    ownerId: searchParams.get('ownerId') || '',
    ownerName: searchParams.get('ownerName') || '',
  });

  // Update filters when URL params change
  useEffect(() => {
    setFilters({
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || '',
      condition: searchParams.get('condition') || '',
      gender: searchParams.get('gender') || '',
      age: searchParams.get('age') || '',
      type: searchParams.get('type') || '',
      city: searchParams.get('city') || '',
      ownerId: searchParams.get('ownerId') || '',
      ownerName: searchParams.get('ownerName') || '',
    });
  }, [searchParams]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.items.list({ ...filters, page: String(page), limit: String(limit) });
      setItems(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters, page, limit]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleFilterChange = (key: string, value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (value) current.set(key, value);
    else current.delete(key);
    router.push(`/catalog?${current.toString()}`);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page on limit change
  };

  const categoryOptions = getCategoryOptions(t);
  const conditionOptions = getConditionOptions(t);
  const genderOptions = getGenderOptions(t);
  const ageOptions = getAgeOptions(t);
  const typeOptions = getTypeOptions(t);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 animate-fade-in-up">
          {filters.ownerName
            ? t('catalog_userItems').replace('{name}', filters.ownerName)
            : t('catalog_title')}
        </h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside
            className="w-full md:w-64 space-y-5 flex-shrink-0 animate-fade-in-up"
            style={{ animationDelay: '100ms' }}
          >
            {/* Search input removed from here, moved to Navbar */}

            {/* City Filter */}
            <div className="pt-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t('catalog_city')}
              </label>
              <input
                type="text"
                placeholder={t('catalog_cityPlaceholder')}
                className="input-field"
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t('catalog_category')}
              </label>
              <select
                className="input-field"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">{t('catalog_allCategories')}</option>
                {categoryOptions
                  .filter((o) => o.value)
                  .map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t('catalog_condition')}
              </label>
              <select
                className="input-field"
                value={filters.condition}
                onChange={(e) => handleFilterChange('condition', e.target.value)}
              >
                <option value="">{t('catalog_anyCondition')}</option>
                {conditionOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t('catalog_gender')}
              </label>
              <select
                className="input-field"
                value={filters.gender}
                onChange={(e) => handleFilterChange('gender', e.target.value)}
              >
                <option value="">{t('catalog_anyGender')}</option>
                {genderOptions
                  .filter((o) => o.value)
                  .map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t('catalog_age')}
              </label>
              <select
                className="input-field"
                value={filters.age}
                onChange={(e) => handleFilterChange('age', e.target.value)}
              >
                <option value="">{t('catalog_anyAge')}</option>
                {ageOptions
                  .filter((o) => o.value)
                  .map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t('catalog_type')}
              </label>
              <select
                className="input-field"
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="">{t('catalog_anyType')}</option>
                {typeOptions
                  .filter((o) => o.value)
                  .map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
              </select>
            </div>

            <button
              onClick={() => router.push('/catalog')}
              className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 transition-colors"
            >
              {t('catalog_resetFilters')}
            </button>
          </aside>

          {/* Items Grid */}
          <div className="flex-1 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            {/* Top bar: total count + per-page selector */}
            {!loading && items.length > 0 && (
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('catalog_found')}:{' '}
                  <span className="font-semibold text-gray-700 dark:text-gray-200">{total}</span>
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{t('catalog_perPage')}:</span>
                  <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                    {PER_PAGE_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleLimitChange(opt)}
                        className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                          limit === opt
                            ? 'bg-teal-500 text-white'
                            : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-5xl mb-4">🔍</p>
                <p>{t('catalog_nothingFound')}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((item) => (
                    <Link
                      key={item.id}
                      href={`/items/${item.id}`}
                      className="card group hover:shadow-lg transition"
                    >
                      <div className="aspect-square bg-gray-100 dark:bg-slate-800 relative overflow-hidden rounded-t-xl">
                        {item.photos?.[0] ? (
                          <img
                            src={getMediaUrl(item.photos[0].url)}
                            alt={item.title}
                            className={`w-full h-full object-cover group-hover:scale-105 transition duration-300 ${['ACCEPTED', 'IN_PROGRESS'].includes(item.exchangeStatus) ? 'opacity-60' : ''}`}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl">
                            🧸
                          </div>
                        )}
                        <div className="absolute top-2 right-2 flex gap-1">
                          {item.condition && (
                            <span className="badge bg-white/90 text-gray-700 shadow-sm text-xs">
                              {getConditionLabel(t, item.condition)}
                            </span>
                          )}
                        </div>
                        {['ACCEPTED', 'IN_PROGRESS'].includes(item.exchangeStatus) && (
                          <div className="absolute bottom-2 left-2 right-2">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/90 text-white text-xs font-medium backdrop-blur-sm shadow">
                              <span className="animate-pulse">✨</span> {t('catalog_inExchange')}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                            {item.title}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                          {item.description}
                        </p>

                        <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <span>📍 {item.owner?.city || t('catalog_noLocation')}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1 mt-10">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-400"
                    >
                      ←
                    </button>
                    {getPageNumbers().map((p, i) =>
                      p === '...' ? (
                        <span key={`dots-${i}`} className="px-2 py-2 text-gray-400 text-sm">
                          …
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                            page === p
                              ? 'bg-teal-500 text-white shadow-sm'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {p}
                        </button>
                      ),
                    )}
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-400"
                    >
                      →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
