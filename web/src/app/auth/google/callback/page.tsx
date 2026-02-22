'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/LanguageContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function GoogleCallbackContent() {
  const { loginWithToken } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setError(t('google_errorNoToken'));
      return;
    }

    const handleCallback = async () => {
      try {
        await loginWithToken(token);
        router.push('/dashboard');
      } catch (err: any) {
        setError(err.message || t('google_errorFailed'));
      }
    };

    handleCallback();
  }, [searchParams, loginWithToken, router, t]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-50 p-4">
        <div className="card p-8 text-center max-w-md">
          <div className="text-4xl mb-4">😕</div>
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <a href="/login" className="btn-primary inline-block">
            {t('login_submit')}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-50 p-4">
      <div className="card p-8 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">{t('google_loading')}</p>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-50 p-4">
          <div className="card p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          </div>
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  );
}
