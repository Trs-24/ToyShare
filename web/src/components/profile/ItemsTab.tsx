'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { getMediaUrl } from '@/lib/utils';
import {
  getConditionLabel,
  getCategoryLabel,
  getAgeLabel,
  getTypeLabel,
} from '@/constants/itemOptions';
import ItemForm, { type ItemFormData } from './ItemForm';

const EMPTY_FORM: ItemFormData = {
  title: '',
  description: '',
  condition: 'GOOD',
  category: '',
  gender: '',
  age: '',
  type: '',
  wishlist: '',
  photos: [],
};

interface ItemsTabProps {
  /** Pre-loaded items (optional). If not provided, will fetch on mount. */
  initialItems?: any[];
  /** Whether to open form immediately (e.g., from URL ?action=add) */
  openForm?: boolean;
}

/**
 * Items management tab — shows user's items grid with CRUD operations.
 * Delegates form rendering to ItemForm component.
 */
export default function ItemsTab({ initialItems, openForm = false }: ItemsTabProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>(initialItems || []);
  const [loading, setLoading] = useState(!initialItems);
  const [showForm, setShowForm] = useState(openForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ItemFormData>(EMPTY_FORM);

  const fetchItems = useCallback(async () => {
    if (!user) return;
    try {
      const data = await api.items.list({ ownerId: user.id });
      setItems(data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!initialItems && user) fetchItems();
  }, [user, initialItems, fetchItems]);

  const handleSave = (item: any) => {
    if (editingId) {
      setItems((prev) => prev.map((i) => (i.id === editingId ? item : i)));
    } else {
      setItems((prev) => [item, ...prev]);
    }
    setShowForm(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
  };

  const handleEdit = (item: any) => {
    setFormData({
      title: item.title,
      description: item.description,
      condition: item.condition,
      category: item.category || '',
      gender: item.gender || '',
      age: item.age || '',
      type: item.type || '',
      wishlist: item.wishlist || '',
      photos: item.photos?.map((p: any) => p.url) || [],
    });
    setEditingId(item.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('dash_deleteConfirm'))) return;
    try {
      await api.items.delete(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
  };

  return (
    <div>
      {/* Form */}
      {showForm && (
        <ItemForm
          editingId={editingId}
          initialData={formData}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {/* Add button */}
      {!showForm && (
        <div className="flex justify-end mb-6">
          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setFormData(EMPTY_FORM);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            {t('nav_addItem')}
          </button>
        </div>
      )}

      {/* Items Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <p className="text-5xl mb-4">📦</p>
          <p className="text-lg">{t('dash_noItems')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="group bg-white dark:bg-slate-900/60 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Photo */}
              <Link href={`/items/${item.id}`} className="block">
                <div className="aspect-[4/3] bg-gray-50 dark:bg-slate-800 relative overflow-hidden">
                  {item.photos?.[0] ? (
                    <img
                      src={getMediaUrl(item.photos[0].url)}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl opacity-40">
                      🧸
                    </div>
                  )}
                  {/* Status badge */}
                  <div className="absolute top-3 left-3">
                    {['ACCEPTED', 'IN_PROGRESS'].includes(item.exchangeStatus) ? (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/90 text-white text-[11px] font-bold">
                        {t('dash_inExchange')}
                      </span>
                    ) : item.isAvailable ? (
                      <span className="px-2.5 py-1 rounded-lg bg-green-500/90 text-white text-[11px] font-bold">
                        {t('dash_available')}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg bg-gray-500/90 text-white text-[11px] font-bold">
                        {t('dash_hidden')}
                      </span>
                    )}
                  </div>
                  {/* Type badge */}
                  {item.type && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-lg bg-teal-500/90 text-white text-[11px] font-bold">
                        {getTypeLabel(t, item.type)}
                      </span>
                    </div>
                  )}
                </div>
              </Link>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 line-clamp-1 mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mb-3">
                  {item.description}
                </p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 text-[11px] font-medium border border-transparent dark:border-gray-700">
                    {getConditionLabel(t, item.condition)}
                  </span>
                  {item.category && (
                    <span className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-[11px] font-medium border border-transparent dark:border-teal-800">
                      {getCategoryLabel(t, item.category)}
                    </span>
                  )}
                  {item.age && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-[11px] font-medium border border-transparent dark:border-amber-800">
                      {getAgeLabel(t, item.age)}
                    </span>
                  )}
                </div>
                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex-1 px-3 py-2 text-sm font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 rounded-xl hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors border border-transparent dark:border-teal-800/50"
                  >
                    {t('dash_editItem')}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex-1 px-3 py-2 text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors border border-transparent dark:border-red-800/50"
                  >
                    {t('dash_deleteItem')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
