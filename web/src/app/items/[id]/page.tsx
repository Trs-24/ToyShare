'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useTranslation } from '@/context/LanguageContext';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getConditionLabel,
  getAgeLabel,
  getGenderLabel,
  getTypeLabel,
  getCategoryLabel,
} from '@/constants/itemOptions';
import { getMediaUrl } from '@/lib/utils';
import { Item } from '@/lib/types';
import Spinner from '@/components/ui/Spinner';
import ItemCard from '@/components/ItemCard';

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const [item, setItem] = useState<Item | null>(null);
  const [similarItems, setSimilarItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [activeProposal, setActiveProposal] = useState<any>(null);

  const loadProposalStatus = (targetItem: any, userData: any) => {
    if (userData && targetItem) {
      api.exchanges
        .list()
        .then((exchanges) => {
          const exchangesList = Array.isArray(exchanges) ? exchanges : [];
          const proposal = exchangesList.find((ex: any) => {
            const targetItemId = String(targetItem.id);
            const currentUserId = String(userData.id);
            return (
              (String(ex.itemRequestedId) === targetItemId ||
                String(ex.itemRequested?.id) === targetItemId) &&
              (String(ex.initiatorId) === currentUserId ||
                String(ex.initiator?.id) === currentUserId) &&
              ex.status === 'PROPOSED'
            );
          });
          setActiveProposal(proposal || null);
        })
        .catch(console.error);
    }
  };

  useEffect(() => {
    if (params.id) {
      Promise.all([api.items.get(params.id as string), api.users.getProfile().catch(() => null)])
        .then(([itemData, userData]) => {
          setItem(itemData);
          setCurrentUser(userData);
          setSelectedPhotoIndex(0);

          loadProposalStatus(itemData, userData);

          if (itemData.category) {
            api.items
              .list({ category: itemData.category, limit: '5' })
              .then((res) => {
                setSimilarItems(res.items.filter((i: Item) => i.id !== itemData.id).slice(0, 4));
              })
              .catch(console.error);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [params.id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <Spinner />
      </>
    );
  }

  if (!item) {
    return (
      <>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-500">
          {t('item_notFound')}
        </div>
      </>
    );
  }

  const isOwner = currentUser?.id === item.ownerId;
  const isInActiveExchange = ['ACCEPTED', 'IN_PROGRESS'].includes(item.exchangeStatus || '');

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-10">
        <Link
          href="/catalog"
          className="inline-flex items-center text-teal-600 hover:text-teal-700 font-semibold mb-8 group transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          {t('item_backToCatalog')}
        </Link>

        <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden mb-16">
          <div className="flex flex-col lg:flex-row">
            {/* Left: Photos */}
            <div className="lg:w-1/2 p-6 lg:p-10 border-r border-gray-50 dark:border-gray-800 bg-gray-50/30 dark:bg-slate-800/30">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-white dark:bg-slate-800 shadow-inner mb-6 relative group">
                {item.photos?.[selectedPhotoIndex] ? (
                  <img
                    src={getMediaUrl(item.photos[selectedPhotoIndex].url)}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-contain p-4"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl opacity-20 filter grayscale">
                    🧸
                  </div>
                )}
                {item.photos && item.photos.length > 1 && (
                  <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() =>
                        setSelectedPhotoIndex((prev) =>
                          prev === 0 ? item.photos!.length - 1 : prev - 1,
                        )
                      }
                      className="w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-gray-800 hover:bg-white transition-all"
                    >
                      ←
                    </button>
                    <button
                      onClick={() =>
                        setSelectedPhotoIndex((prev) =>
                          prev === item.photos!.length - 1 ? 0 : prev + 1,
                        )
                      }
                      className="w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-gray-800 hover:bg-white transition-all"
                    >
                      →
                    </button>
                  </div>
                )}
              </div>
              {item.photos && item.photos.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {item.photos.map((photo, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedPhotoIndex(index)}
                      className={`w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                        selectedPhotoIndex === index
                          ? 'border-teal-500 scale-105'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={getMediaUrl(photo.url)}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                        alt=""
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Info */}
            <div className="lg:w-1/2 p-6 lg:p-10 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {item.condition && (
                    <span className="px-4 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold shadow-sm uppercase tracking-wider">
                      {getConditionLabel(t, item.condition)}
                    </span>
                  )}
                  {item.category && (
                    <span className="px-4 py-1.5 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-xs font-bold uppercase tracking-wider">
                      {getCategoryLabel(t, item.category)}
                    </span>
                  )}
                </div>

                <h1 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-4 leading-tight">
                  {item.title}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed line-clamp-4">
                  {item.description}
                </p>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                  <div className="p-5 rounded-3xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-gray-700 space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                      {t('item_age')}
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {item.age ? getAgeLabel(t, item.age) : t('notSpecified')}
                    </p>
                  </div>
                  <div className="p-5 rounded-3xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-gray-700 space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                      {t('item_gender')}
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {item.gender ? getGenderLabel(t, item.gender) : t('notSpecified')}
                    </p>
                  </div>
                  <div className="p-5 rounded-3xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-gray-700 space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                      {t('item_type')}
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {item.type ? getTypeLabel(t, item.type) : t('notSpecified')}
                    </p>
                  </div>
                  <div className="p-5 rounded-3xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-gray-700 space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                      {t('item_added')}
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {item.wishlist && (
                  <div className="mb-10 p-6 rounded-[28px] bg-teal-50/50 dark:bg-teal-900/20 border border-teal-100/50 dark:border-teal-800/50">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">🔍</span>
                      <h3 className="text-sm font-black text-teal-900 dark:text-teal-200 uppercase tracking-widest">
                        {t('item_lookingFor')}
                      </h3>
                    </div>
                    <p className="text-lg font-medium text-teal-900/80 dark:text-teal-100/80 leading-relaxed">
                      {item.wishlist}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-8 border-t border-gray-100 dark:border-gray-800 space-y-8">
                {item.owner && (
                  <div className="flex items-center justify-between p-6 rounded-3xl bg-teal-50/50 dark:bg-teal-900/20 border border-teal-100/50 dark:border-teal-800/50">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-3xl shadow-sm border border-teal-100 dark:border-teal-800 overflow-hidden">
                        {item.owner.avatarUrl ? (
                          <img
                            src={getMediaUrl(item.owner.avatarUrl)}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                            alt="Avatar"
                          />
                        ) : (
                          '👤'
                        )}
                      </div>
                      <div>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {item.owner.name}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1.5 text-sm">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          {item.owner.city || t('item_noLocation')}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/catalog?ownerId=${item.ownerId}&ownerName=${encodeURIComponent(item.owner.name || '')}`}
                      className="px-6 py-3 rounded-2xl border-2 border-teal-500 text-teal-600 font-bold hover:bg-teal-500 hover:text-white transition-all shadow-sm flex items-center gap-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                        />
                      </svg>
                      {t('item_viewAllItems')}
                    </Link>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-4">
                  {!isOwner && currentUser && !isInActiveExchange && (
                    <button
                      onClick={() => router.push(`/items/${item.id}/propose`)}
                      className={`flex-1 px-6 py-4 text-white font-bold rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 ${activeProposal ? 'bg-amber-500 hover:bg-amber-600' : 'bg-teal-500 hover:bg-teal-600'}`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        {activeProposal ? (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        ) : (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                          />
                        )}
                      </svg>
                      {activeProposal ? t('item_changeProposal') : t('item_proposeExchange')}
                    </button>
                  )}
                  {isInActiveExchange && (
                    <div className="flex-1 px-6 py-4 bg-gray-100 text-gray-500 font-bold rounded-2xl flex items-center justify-center gap-2 border border-gray-200 cursor-not-allowed">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                        />
                      </svg>
                      {t('item_inExchange')}
                    </div>
                  )}
                  {!currentUser && (
                    <Link
                      href="/login"
                      className="flex-1 px-6 py-4 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      {t('nav_login')}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Suggestions */}
        {similarItems.length > 0 && (
          <div className="mb-20">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t('item_similarItems')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarItems.map((similarItem) => (
                <ItemCard key={similarItem.id} item={similarItem} t={t} />
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
