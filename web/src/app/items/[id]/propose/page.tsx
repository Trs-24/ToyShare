'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getMediaUrl } from '@/lib/utils';
import { useTranslation } from '@/context/LanguageContext';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function ProposeExchangePage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const [targetItem, setTargetItem] = useState<any>(null);
  const [myItems, setMyItems] = useState<any[]>([]);
  const [exchanges, setExchanges] = useState<any[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadData();
    }
  }, [params.id]);

  const loadData = async () => {
    try {
      const [itemRes, profileRes] = await Promise.all([
        api.items.get(params.id as string),
        api.users.getProfile(),
      ]);
      setTargetItem(itemRes);

      const [itemsRes, exchangesRes] = await Promise.all([
        api.items.list({ ownerId: profileRes.id }),
        api.exchanges.list(),
      ]);
      setMyItems(itemsRes.items);
      setExchanges(Array.isArray(exchangesRes) ? exchangesRes : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const isAlreadyProposed = (itemId: string) => {
    if (!targetItem) return false;
    return exchanges.some(
      (ex) =>
        ex.status === 'PROPOSED' &&
        ((ex.itemOfferedId === itemId && ex.itemRequestedId === targetItem.id) ||
          (ex.itemOfferedId === targetItem.id && ex.itemRequestedId === itemId)),
    );
  };

  const isRecommended = (item: any) => {
    if (!targetItem?.wishlist) return false;
    const wishes = targetItem.wishlist.toLowerCase();
    const title = item.title.toLowerCase();
    const desc = (item.description || '').toLowerCase();

    // Split wishlist into keywords (basic version: words > 3 chars)
    const keywords = wishes.split(/[,\s.]+/).filter((k: string) => k.length > 3);
    if (keywords.length === 0) return false;
    return keywords.some((k: string) => title.includes(k) || desc.includes(k));
  };

  const handlePropose = async () => {
    if (!selectedItemId || !targetItem) return;

    setSubmitting(true);
    try {
      await api.exchanges.create({
        offeredItemId: selectedItemId,
        requestedItemId: targetItem.id,
        note,
      });
      alert(t('propose_success'));
      router.push(`/items/${targetItem.id}`);
    } catch (e: any) {
      alert(e?.message || t('propose_error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500" />
        </div>
      </div>
    );
  }

  if (!targetItem) return null;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          href={`/items/${targetItem.id}`}
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
          {t('item_backToItem') || 'Назад к товару'}
        </Link>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {t('propose_title') || 'Предложить обмен'}
          </h1>
          <p className="text-lg text-gray-500">
            {t('propose_subtitle_prefix') || 'Выберите, что предложить взамен на'} «
            <span className="font-semibold">{targetItem.title}</span>»
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Left Column: Target Item */}
          <div>
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
              {t('propose_youWantToGet') || 'ВЫ ХОТИТЕ ПОЛУЧИТЬ'}
            </h2>
            <div className="bg-white rounded-[32px] border-2 border-teal-100/50 shadow-sm overflow-hidden h-full flex flex-col">
              <div className="p-8 flex items-center gap-6 flex-1">
                <div className="w-32 h-32 rounded-2xl bg-gray-50 overflow-hidden flex-shrink-0">
                  {targetItem.photos?.[0] ? (
                    <img
                      src={getMediaUrl(targetItem.photos[0].url)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      🧸
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{targetItem.title}</h3>
                  <p className="text-gray-500 font-medium mb-3">
                    {targetItem.owner?.name} • {targetItem.owner?.city}
                  </p>
                  <span className="inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider">
                    {targetItem.condition === 'NEW' ? 'Новое' : 'Б/у'}
                  </span>
                </div>
              </div>

              <div className="bg-teal-50/30 p-8 pt-6 border-t border-teal-50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-teal-500">🪄</span>
                  <h4 className="text-sm font-bold text-teal-800 uppercase tracking-wider">
                    {t('item_lookingFor') || 'Пожелания к обмену'}:
                  </h4>
                </div>
                <p className="text-gray-600 font-medium leading-relaxed">
                  {targetItem.wishlist || t('propose_noWishes') || 'Любые встречные предложения'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: User Items */}
          <div>
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
              {t('propose_selectYourItem') || 'ВЫБЕРИТЕ ВАШ ТОВАР ДЛЯ ОБМЕНА'}
            </h2>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 pb-10 scrollbar-hide">
              {myItems.length === 0 ? (
                <div className="p-12 text-center bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200">
                  <p className="text-gray-500 mb-4">
                    {t('propose_noOwnItems') || 'У вас еще нет товаров для обмена'}
                  </p>
                  <Link href="/dashboard" className="text-teal-600 font-bold hover:underline">
                    {t('propose_addFirstItem') || 'Добавить первый товар'}
                  </Link>
                </div>
              ) : (
                myItems.map((item) => {
                  const disabled = isAlreadyProposed(item.id);
                  const isSelected = selectedItemId === item.id;

                  return (
                    <div
                      key={item.id}
                      onClick={() => !disabled && setSelectedItemId(item.id)}
                      className={`relative cursor-pointer flex items-center gap-6 p-4 rounded-[28px] border-2 transition-all mb-4 ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50/30'
                          : disabled
                            ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                            : 'border-gray-200 hover:border-gray-300 shadow-sm'
                      }`}
                    >
                      <div className="w-20 h-20 rounded-2xl bg-gray-50 overflow-hidden flex-shrink-0">
                        {item.photos?.[0] ? (
                          <img
                            src={getMediaUrl(item.photos[0].url)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">
                            🧸
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2 mb-1.5">
                          <h3 className="font-bold text-gray-900 truncate max-w-[140px]">
                            {item.title}
                          </h3>
                          {isRecommended(item) && (
                            <span className="px-2 py-0.5 rounded-lg bg-orange-100 text-orange-700 text-[9px] font-black uppercase tracking-tighter flex-shrink-0">
                              ✨ Рекомендовано
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-500 font-medium mb-2">
                          {item.condition === 'NEW'
                            ? t('condition_NEW') || 'Новое'
                            : t('condition_LIKE_NEW') || 'Как новое'}
                        </p>

                        {disabled && (
                          <div className="flex mt-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100/80 text-red-700 text-[10px] font-black border border-red-200 uppercase tracking-tighter">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                              {t('propose_alreadyProposed') || 'УЖЕ ПРЕДЛОЖЕНО'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0 pr-2">
                        <div
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-teal-500 border-teal-500' : 'border-gray-300'
                          }`}
                        >
                          {isSelected && (
                            <svg
                              className="w-5 h-5 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="3"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Message Field */}
        <div className="max-w-2xl mx-auto mb-12">
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
            {t('propose_note') || 'СООБЩЕНИЕ (НЕОБЯЗАТЕЛЬНО)'}
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('propose_notePlaceholder') || 'Привет! Хочу предложить обмен...'}
            rows={3}
            className="w-full px-6 py-4 rounded-[24px] border-2 border-gray-100 focus:border-teal-400 focus:ring-4 focus:ring-teal-50 outline-none transition-all resize-none font-medium text-gray-700 bg-gray-50/30"
          />
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <button
            onClick={handlePropose}
            disabled={!selectedItemId || submitting}
            className="px-12 py-5 bg-teal-500 text-white font-black text-xl rounded-[24px] hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-teal-100 hover:shadow-teal-200 active:scale-[0.98] flex items-center gap-3"
          >
            {submitting ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
                {t('propose_submitBtn') || 'Предложить обмен'}
              </>
            )}
          </button>
        </div>
      </main>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
