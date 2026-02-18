'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useTranslation } from '@/context/LanguageContext';
import Navbar from '@/components/Navbar';
import ProposeExchangeModal from '@/components/ProposeExchangeModal';
import { getConditionLabel } from '@/constants/itemOptions';
import { getMediaUrl } from '@/lib/utils';
import { Item } from '@/lib/types';

export default function ItemDetailPage() {
  const params = useParams();
  const { t, locale } = useTranslation();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  useEffect(() => {
    if (params.id) {
      Promise.all([
        api.items.get(params.id as string),
        api.users.getProfile().catch(() => null)
      ])
        .then(([itemData, userData]) => {
          setItem(itemData);
          setCurrentUser(userData);
          setSelectedPhotoIndex(0);
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
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
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Main Photo */}
          <div className="aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center overflow-hidden relative">
            {photos.length > 0 ? (
              <img
                src={getMediaUrl(photos[selectedPhotoIndex].url)}
                alt={item.title}
                className="w-full h-full object-cover transition-opacity duration-300"
                key={selectedPhotoIndex}
              />
            ) : (
              <span className="text-8xl">🧸</span>
            )}

            {/* Arrow navigation for multiple photos */}
            {hasMultiplePhotos && (
              <>
                <button
                  onClick={() => setSelectedPhotoIndex((prev: number) => (prev - 1 + photos.length) % photos.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-sm transition-all"
                >
                  ‹
                </button>
                <button
                  onClick={() => setSelectedPhotoIndex((prev: number) => (prev + 1) % photos.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-sm transition-all"
                >
                  ›
                </button>
                {/* Photo counter */}
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/40 text-white text-sm backdrop-blur-sm">
                  {selectedPhotoIndex + 1} / {photos.length}
                </div>
              </>
            )}

            {/* Action Button */}
            {!isOwner && currentUser && !isInActiveExchange && (
              <div className="absolute bottom-6 right-6">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                >
                  <span>{t('item_proposeExchange')}</span>
                </button>
              </div>
            )}
            {isInActiveExchange && (
              <div className="absolute bottom-6 left-6 right-6">
                <div className="px-5 py-3 bg-purple-600/90 text-white font-medium rounded-xl shadow-lg backdrop-blur-sm text-center flex items-center justify-center gap-2">
                  <span>{t('item_inExchange')}</span>
                </div>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {hasMultiplePhotos && (
            <div className="flex gap-2 px-4 py-3 bg-gray-50 overflow-x-auto">
              {photos.map((photo: any, index: number) => (
                <button
                  key={photo.id || index}
                  onClick={() => setSelectedPhotoIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${index === selectedPhotoIndex
                    ? 'border-indigo-500 ring-2 ring-indigo-200 scale-105'
                    : 'border-transparent opacity-70 hover:opacity-100 hover:border-gray-300'
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
          <div className="p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{item.title}</h1>
              <div className="flex gap-2">
                <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium">
                  {getConditionLabel(t, item.condition || 'GOOD')}
                </span>
                {item.category && (
                  <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm font-medium">
                    {item.category}
                  </span>
                )}
              </div>
            </div>

            <p className="text-gray-600 text-lg leading-relaxed mb-8">{item.description}</p>

            {item.wishlist && (
              <div className="p-6 bg-amber-50 rounded-xl border border-amber-100 mb-8">
                <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wide mb-2">{t('item_lookingFor')}</h3>
                <p className="text-amber-900 font-medium">
                  {item.wishlist}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
              {item.owner && (
                <div className="flex items-center gap-4">
                  {item.owner.avatarUrl ? (
                    <img
                      src={getMediaUrl(item.owner.avatarUrl || '')}
                      alt={item.owner.name || ''}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                      {item.owner.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-gray-900">{item.owner.name}</p>
                    <p className="text-sm text-gray-500">{t('item_owner')} • {item.owner.city || t('item_noLocation')}</p>
                  </div>
                </div>
              )}

              <div className="text-sm text-gray-400">
                {t('item_posted')} {new Date(item.createdAt).toLocaleDateString(dateLocale)}
              </div>
            </div>
          </div>
        </div>
      </main>

      <ProposeExchangeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        targetItem={item}
      />
    </>
  );
}
