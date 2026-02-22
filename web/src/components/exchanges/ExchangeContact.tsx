'use client';

import { useTranslation } from '@/context/LanguageContext';
import { User } from '@/lib/types';

interface ExchangeContactProps {
  user: User;
}

export default function ExchangeContact({ user }: ExchangeContactProps) {
  const { t } = useTranslation();

  return (
    <div className="mb-8 bg-gradient-to-r from-teal-50 to-emerald-50 p-6 rounded-2xl border border-teal-100">
      <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
        {t('exDetail_contactTitle')}
      </h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="flex items-center gap-3 bg-white/70 p-4 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
            <span className="text-teal-600 text-lg">👤</span>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">{t('exDetail_contactName')}</p>
            <p className="text-sm font-semibold text-gray-900">{user.name || '—'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white/70 p-4 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <span className="text-green-600 text-lg">📞</span>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">{t('exDetail_contactPhone')}</p>
            <p className="text-sm font-semibold text-gray-900">
              {user.phone || t('exDetail_contactPhoneEmpty')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white/70 p-4 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <span className="text-amber-600 text-lg">📍</span>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">{t('exDetail_contactCity')}</p>
            <p className="text-sm font-semibold text-gray-900">
              {user.city || t('exDetail_contactCityEmpty')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white/70 p-4 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <span className="text-blue-600 text-lg">✉️</span>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">{t('exDetail_contactEmail')}</p>
            <p className="text-sm font-semibold text-gray-900">{user.email || '—'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
