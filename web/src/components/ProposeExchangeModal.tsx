
'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { getMediaUrl } from '@/lib/utils';
import { useTranslation } from '@/context/LanguageContext';

interface ProposeExchangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetItem: any;
}

export default function ProposeExchangeModal({ isOpen, onClose, targetItem }: ProposeExchangeModalProps) {
    const { t } = useTranslation();
    const [myItems, setMyItems] = useState<any[]>([]);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadMyItems();
        }
    }, [isOpen]);

    const loadMyItems = async () => {
        try {
            const profile = await api.users.getProfile();
            const data = await api.items.list({ ownerId: profile.id });
            setMyItems(data.items);
        } catch (e) {
            console.error(e);
        }
    };

    const handlePropose = async () => {
        if (!selectedItemId) return;

        setLoading(true);
        try {
            await api.exchanges.create({
                offeredItemId: selectedItemId,
                requestedItemId: targetItem.id,
                note,
            });
            onClose();
            alert(t('propose_success'));
        } catch (e) {
            alert(t('propose_error'));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-xl">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">{t('propose_title')}</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {t('propose_subtitle')} <span className="font-medium text-indigo-600">{targetItem.title}</span>
                    </p>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">{t('propose_selectItem')}</h3>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {myItems.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => setSelectedItemId(item.id)}
                                className={`cursor-pointer border-2 rounded-xl p-2 relative transition-all ${selectedItemId === item.id
                                    ? 'border-indigo-600 bg-indigo-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="aspect-square bg-gray-100 rounded-lg mb-2 overflow-hidden">
                                    {item.photos?.[0] ? (
                                        <img src={getMediaUrl(item.photos[0].url)} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-2xl">🧸</div>
                                    )}
                                </div>
                                <p className="text-xs font-medium text-gray-900 truncate">{item.title}</p>
                            </div>
                        ))}
                    </div>

                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('propose_note')}</label>
                    <textarea
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-shadow"
                        rows={3}
                        placeholder={t('propose_notePlaceholder')}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                </div>

                <div className="p-6 border-t border-gray-100 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 text-gray-700 font-medium hover:bg-gray-50 rounded-xl transition-colors"
                    >
                        {t('propose_cancelBtn')}
                    </button>
                    <button
                        onClick={handlePropose}
                        disabled={!selectedItemId || loading}
                        className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shadow-indigo-200"
                    >
                        {loading ? t('propose_submitting') : t('propose_submitBtn')}
                    </button>
                </div>
            </div>
        </div>
    );
}
