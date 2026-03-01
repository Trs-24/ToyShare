'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from '@/context/LanguageContext';
import { useState, useEffect } from 'react';

/**
 * Search input component used in the Navbar on the catalog page.
 * Reads the current `search` query param and syncs it to the URL on Enter or click.
 */
export default function SearchInput() {
  const router = useRouter();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setSearchTerm(params.get('search') || '');
    }
  }, []);

  const handleSearch = () => {
    if (typeof window === 'undefined') return;
    const currentParams = new URLSearchParams(window.location.search);
    if (searchTerm) {
      currentParams.set('search', searchTerm);
    } else {
      currentParams.delete('search');
    }
    router.push(`/catalog?${currentParams.toString()}`);
  };

  return (
    <>
      <input
        type="text"
        placeholder={t('catalog_searchPlaceholder') || 'Search...'}
        className="w-full pl-10 pr-10 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder-gray-400 dark:placeholder-gray-500"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSearch();
        }}
      />
      <svg
        className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <button
        onClick={handleSearch}
        className="absolute right-2 top-1 p-1.5 rounded-full text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors"
        aria-label="Search"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </svg>
      </button>
    </>
  );
}
