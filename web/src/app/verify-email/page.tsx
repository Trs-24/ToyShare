'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { useTranslation } from '@/context/LanguageContext';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    !token ? 'error' : 'loading',
  );
  const [message, setMessage] = useState(!token ? 'Missing verification token.' : '');

  useEffect(() => {
    if (!token) return;

    api.auth
      .verifyEmail(token)
      .then(() => {
        setStatus('success');
        setTimeout(() => router.push('/dashboard'), 3000);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed.');
      });
  }, [searchParams, router]);

  return (
    <div className="max-w-md mx-auto mt-20 p-8 card text-center">
      {status === 'loading' && (
        <div className="animate-pulse">
          <div className="text-4xl mb-4">⏳</div>
          <h2 className="text-xl font-semibold">{t('loading')}</h2>
        </div>
      )}

      {status === 'success' && (
        <div>
          <div className="text-5xl mb-4 text-green-500">✅</div>
          <h2 className="text-2xl font-bold mb-2">Email Verified!</h2>
          <p className="text-gray-600">
            Your account is now fully active. Redirecting to dashboard...
          </p>
        </div>
      )}

      {status === 'error' && (
        <div>
          <div className="text-5xl mb-4 text-red-500">❌</div>
          <h2 className="text-2xl font-bold mb-2 text-red-600">Verification Failed</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <button onClick={() => router.push('/dashboard')} className="btn-primary">
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="text-center mt-20">Loading...</div>}>
        <VerifyEmailContent />
      </Suspense>
    </>
  );
}
