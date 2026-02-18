'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { getMediaUrl } from '@/lib/utils';
import { useTranslation } from '@/context/LanguageContext';
import { Item } from '@/lib/types';




export default function AdminItemsPage() {
    const { t } = useTranslation();
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const loadItems = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.admin.getItems(search || undefined);
            setItems(data);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    }, [search]);

    useEffect(() => {
        const timer = setTimeout(loadItems, 300);
        return () => clearTimeout(timer);
    }, [loadItems]);

    const toggleAvailability = async (item: Item) => {
        setActionLoading(item.id);
        try {
            await api.admin.updateItem(item.id, { isAvailable: !item.isAvailable });
            loadItems();
        } catch (e) {
            console.error(e);
        }
        setActionLoading(null);
    };

    const deleteItem = async (item: Item) => {
        if (!confirm(`${t('admin_delete')} "${item.title}"?`)) return;
        setActionLoading(item.id);
        try {
            await api.admin.deleteItem(item.id);
            loadItems();
        } catch (e) {
            console.error(e);
        }
        setActionLoading(null);
    };

    const conditionLabels: Record<string, string> = {
        NEW: t('condition_NEW'),
        LIKE_NEW: t('condition_LIKE_NEW'),
        GOOD: t('condition_GOOD'),
        FAIR: t('condition_FAIR'),
        POOR: t('condition_POOR'),
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">{t('admin_items')}</h1>
                <p className="text-gray-500 mt-1">Moderatation of items</p>
            </div>

            {/* Search */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder={t('catalog_searchPlaceholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input-field max-w-md"
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('admin_colItem')}</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('admin_colCategory')}</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('admin_colCondition')}</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('admin_colOwner')}</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('admin_colStatus')}</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('admin_colCreated')}</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('admin_colActions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {item.photos[0] ? (
                                                    <img
                                                        src={getMediaUrl(item.photos[0].url)}
                                                        alt={item.title}
                                                        className="w-10 h-10 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg">
                                                        🧸
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-medium text-gray-900 text-sm">{item.title}</div>
                                                    <div className="text-xs text-gray-400 max-w-[200px] truncate">{item.description}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {item.category ? t(`category_${item.category}` as any) : '—'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                                                {conditionLabels[item.condition] || item.condition}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{item.owner?.name || '—'}</div>
                                            <div className="text-xs text-gray-400">{item.owner?.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${item.isAvailable
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                                }`}>
                                                {item.isAvailable ? t('dash_available') : t('dash_hidden')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400">
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => toggleAvailability(item)}
                                                    disabled={actionLoading === item.id}
                                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${item.isAvailable
                                                        ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                                                        : 'text-green-600 bg-green-50 hover:bg-green-100'
                                                        }`}
                                                >
                                                    {item.isAvailable ? t('admin_hide') : t('admin_show')}
                                                </button>
                                                <button
                                                    onClick={() => deleteItem(item)}
                                                    disabled={actionLoading === item.id}
                                                    className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                                >
                                                    {t('admin_delete')}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {items.length === 0 && (
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
