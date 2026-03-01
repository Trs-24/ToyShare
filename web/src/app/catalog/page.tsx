'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { api } from '@/lib/api';
import { useTranslation } from '@/context/LanguageContext';
import Navbar from '@/components/Navbar';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  getCategoryOptions,
  getAgeOptions,
  getTypeOptions,
  getConditionOptions,
  getGenderOptions,
} from '@/constants/itemOptions';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import FilterSelect from '@/components/ui/FilterSelect';
import ItemCard from '@/components/ItemCard';
import type { Item } from '@/lib/types';

const PER_PAGE_OPTIONS = [15, 30, 100];

export default function HomePage() {
  return (
    <Suspense fallback={<Spinner />}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const { t } = useTranslation();
  const [items, setItems] = useState<Item[]>([]);
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
    setPage(1);
  };

  const categoryOptions = getCategoryOptions(t);
  const conditionOptions = getConditionOptions(t);
  const genderOptions = getGenderOptions(t);
  const ageOptions = getAgeOptions(t);
  const typeOptions = getTypeOptions(t);

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
            {/* City Filter (text input, not a select) */}
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

            <FilterSelect
              label={t('catalog_category')}
              value={filters.category}
              onChange={(v) => handleFilterChange('category', v)}
              options={categoryOptions}
              placeholder={t('catalog_allCategories')}
            />
            <FilterSelect
              label={t('catalog_condition')}
              value={filters.condition}
              onChange={(v) => handleFilterChange('condition', v)}
              options={conditionOptions}
              placeholder={t('catalog_anyCondition')}
            />
            <FilterSelect
              label={t('catalog_gender')}
              value={filters.gender}
              onChange={(v) => handleFilterChange('gender', v)}
              options={genderOptions}
              placeholder={t('catalog_anyGender')}
            />
            <FilterSelect
              label={t('catalog_age')}
              value={filters.age}
              onChange={(v) => handleFilterChange('age', v)}
              options={ageOptions}
              placeholder={t('catalog_anyAge')}
            />
            <FilterSelect
              label={t('catalog_type')}
              value={filters.type}
              onChange={(v) => handleFilterChange('type', v)}
              options={typeOptions}
              placeholder={t('catalog_anyType')}
            />

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
                  <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
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
              <Spinner className="flex justify-center py-12" />
            ) : items.length === 0 ? (
              <EmptyState icon="🔍" message={t('catalog_nothingFound')} />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((item) => (
                    <ItemCard key={item.id} item={item} t={t} />
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
