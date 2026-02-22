'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useTranslation } from '@/context/LanguageContext';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import ProposeExchangeModal from '@/components/ProposeExchangeModal';
import {
  getConditionLabel,
  getAgeLabel,
  getGenderLabel,
  getTypeLabel,
  getCategoryLabel,
} from '@/constants/itemOptions';
import { getMediaUrl } from '@/lib/utils';
import { Item } from '@/lib/types';

export default function ItemDetailPage() {
  const params = useParams();
  const { t, locale } = useTranslation();
  const [item, setItem] = useState<Item | null>(null);
  const [similarItems, setSimilarItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  useEffect(() => {
    if (params.id) {
      Promise.all([api.items.get(params.id as string), api.users.getProfile().catch(() => null)])
        .then(([itemData, userData]) => {
          setItem(itemData);
          setCurrentUser(userData);
          setSelectedPhotoIndex(0);

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
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
        </div>
      </>
    );
  }

  if (!item) {
    return (
      <>
        <Navbar />
        <div className="text-center py-16 text-gray-400">{t('item_notFound')}</div>
      </>
    );
  }

  const isOwner = currentUser && item.ownerId === currentUser.id;
  const isInActiveExchange = ['ACCEPTED', 'IN_PROGRESS'].includes(item.exchangeStatus || '');
  const photos = item.photos || [];
  const hasMultiplePhotos = photos.length > 1;
  const dateLocale = locale === 'uk' ? 'uk-UA' : locale === 'ru' ? 'ru-RU' : 'en-US';

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Link
          href="/catalog"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
        >
          {t('item_backToCatalog')}
        </Link>

        <div className="bg-white rounded-3xl overflow-hidden mb-16 border border-gray-100 shadow-sm">
          <div className="flex flex-col md:flex-row">
            {/* Left Column: Image Viewer */}
            <div className="md:w-1/2 p-2 md:p-6 lg:p-8 bg-gray-50/50 flex flex-col justify-center">
              <div className="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden relative shadow-inner">
                {photos.length > 0 ? (
                  <img
                    src={getMediaUrl(photos[selectedPhotoIndex].url)}
                    alt={item.title}
                    className="w-full h-full object-cover transition-opacity duration-300"
                    key={selectedPhotoIndex}
                  />
                ) : (
                  <span className="text-8xl opacity-50 filter grayscale">🧸</span>
                )}

                {/* Arrow navigation for multiple photos */}
                {hasMultiplePhotos && (
                  <>
                    <button
                      onClick={() =>
                        setSelectedPhotoIndex(
                          (prev: number) => (prev - 1 + photos.length) % photos.length,
                        )
                      }
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/50 hover:bg-white text-gray-800 flex items-center justify-center backdrop-blur shadow-sm transition-all"
                    >
                      ‹
                    </button>
                    <button
                      onClick={() =>
                        setSelectedPhotoIndex((prev: number) => (prev + 1) % photos.length)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/50 hover:bg-white text-gray-800 flex items-center justify-center backdrop-blur shadow-sm transition-all"
                    >
                      ›
                    </button>
                    {/* Photo counter */}
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/60 text-gray-800 text-xs font-medium backdrop-blur shadow-sm border border-white/20">
                      {selectedPhotoIndex + 1} / {photos.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {hasMultiplePhotos && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2 justify-center">
                  {photos.map((photo: any, index: number) => (
                    <button
                      key={photo.id || index}
                      onClick={() => setSelectedPhotoIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                        index === selectedPhotoIndex
                          ? 'border-teal-500 scale-105 shadow-sm'
                          : 'border-transparent opacity-70 hover:opacity-100 hover:border-gray-300 shadow-sm'
                      }`}
                    >
                      <img
                        src={getMediaUrl(photo.url)}
                        alt={`${item.title} — ${t('item_photo')} ${index + 1}` || ''}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Info */}
            <div className="md:w-1/2 p-6 md:p-10 flex flex-col pt-8 md:pt-10">
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-5">
                {item.type && (
                  <span className="px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-xs font-semibold flex items-center gap-1">
                    <span className="text-[10px]">⇄</span> {getTypeLabel(t, item.type)}
                  </span>
                )}
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                  {getConditionLabel(t, item.condition || 'GOOD')}
                </span>
                {item.category && (
                  <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                    {getCategoryLabel(t, item.category)}
                  </span>
                )}
                {item.gender && item.gender !== 'UNISEX' && (
                  <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                    {getGenderLabel(t, item.gender)}
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                {item.title}
              </h1>

              <p className="text-gray-600 leading-relaxed mb-8">{item.description}</p>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
                  <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                    {t('item_age')}
                  </p>
                  <p className="font-semibold text-gray-900">
                    {item.age ? getAgeLabel(t, item.age) : t('notSpecified')}
                  </p>
                </div>
                <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
                  <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {t('item_added')}
                  </p>
                  <p className="font-semibold text-gray-900">
                    {new Date(item.createdAt).toLocaleDateString(dateLocale)}
                  </p>
                </div>
              </div>

              {/* Looking for */}
              {item.wishlist && (
                <div className="p-5 border-2 border-dashed border-teal-200 bg-teal-50/50 rounded-2xl mb-auto">
                  <p className="text-sm font-semibold text-teal-700 mb-2 flex items-center gap-1">
                    💡 {t('item_lookingFor')}:
                  </p>
                  <p className="text-gray-800 text-sm">{item.wishlist}</p>
                </div>
              )}

              <div className="mt-8 pt-8 border-t border-gray-100">
                {/* Owner Block */}
                {item.owner && (
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-2xl mb-6 bg-white hover:border-gray-300 transition-colors">
                    <div className="flex items-center gap-3">
                      {item.owner.avatarUrl ? (
                        <img
                          src={getMediaUrl(item.owner.avatarUrl || '')}
                          alt={item.owner.name || ''}
                          className="w-12 h-12 rounded-full object-cover border border-gray-100"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center text-teal-700 font-bold text-lg shadow-inner">
                          {item.owner.name?.[0]?.toUpperCase() || '?'}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-gray-900">{item.owner.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                          <span className="text-amber-400">★</span> 4.8{' '}
                          <span className="mx-1">•</span>
                          <svg
                            className="w-3.5 h-3.5"
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
                          {item.owner.city || t('catalog_noLocation')}
                        </p>
                      </div>
                    </div>
                    <button className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors hidden sm:flex items-center gap-2">
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
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      {t('item_viewProfile')}
                    </button>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-4">
                  {!isOwner && currentUser && !isInActiveExchange && (
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="flex-1 px-6 py-4 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
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
                          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                        />
                      </svg>
                      {t('item_proposeExchange')}
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

                  <button className="w-[60px] h-[60px] rounded-2xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all bg-white shadow-sm hover:shadow-md flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Suggestions */}
        {similarItems.length > 0 && (
          <div className="mb-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('item_similarItems')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarItems.map((similarItem) => (
                <Link
                  key={similarItem.id}
                  href={`/items/${similarItem.id}`}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 block"
                >
                  <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden">
                    {similarItem.photos?.[0] ? (
                      <img
                        src={getMediaUrl(similarItem.photos[0].url)}
                        alt={similarItem.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl opacity-40 filter grayscale">
                        🧸
                      </div>
                    )}
                    <div className="absolute top-3 right-3 flex gap-1">
                      {similarItem.type && (
                        <span className="px-2.5 py-1 rounded bg-teal-500/90 text-white shadow-sm text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
                          {getTypeLabel(t, similarItem.type)}
                        </span>
                      )}
                    </div>
                    <div className="absolute top-3 left-3 flex gap-1">
                      {similarItem.condition && (
                        <span className="px-2.5 py-1 rounded-lg bg-white/95 text-gray-700 shadow-sm text-[11px] font-semibold backdrop-blur border border-gray-100">
                          {getConditionLabel(t, similarItem.condition)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 line-clamp-1 mb-1.5">
                      {similarItem.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-3.5 h-3.5"
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
                        {similarItem.owner?.city || t('catalog_noLocation')}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <ProposeExchangeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        targetItem={item}
      />
    </>
  );
}
