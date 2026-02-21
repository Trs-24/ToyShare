'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';

const STEPS = [1, 2] as const;

export default function RegisterPage() {
  const { register } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1: Account
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Step 2: Location & Shipping
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [defaultPostOffice, setDefaultPostOffice] = useState('');

  const validateStep1 = () => {
    if (!name.trim()) return t('register_nameRequired');
    if (!email.trim()) return t('register_emailRequired');
    if (password.length < 6) return t('register_passwordMin');
    return null;
  };

  const validateStep2 = () => {
    if (!phone.trim()) return t('register_phoneRequired');
    return null;
  };

  const handleNext = () => {
    setError('');
    const err = validateStep1();
    if (err) {
      setError(err);
      return;
    }
    setStep(2);
  };

  const handleBack = () => {
    setError('');
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const err = validateStep2();
    if (err) {
      setError(err);
      return;
    }

    setLoading(true);
    try {
      await register({
        name,
        email,
        password,
        phone,
        country: country || undefined,
        city: city || undefined,
        defaultPostOffice: defaultPostOffice || undefined,
      });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || t('register_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = api.auth.googleLoginUrl();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium mb-6"
        >
          {t('register_backToHome')}
        </Link>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            🧸 ToyShare
          </h1>
          <p className="text-gray-500 mt-2">{t('register_title')}</p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {STEPS.map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step >= s ? 'bg-indigo-500 text-white shadow-md' : 'bg-gray-200 text-gray-400'
                }`}
              >
                {s}
              </div>
              <span
                className={`text-sm hidden sm:inline ${step >= s ? 'text-indigo-600 font-medium' : 'text-gray-400'}`}
              >
                {s === 1 ? t('register_step1') : t('register_step2')}
              </span>
              {s < STEPS.length && (
                <div className={`w-8 h-0.5 ${step > s ? 'bg-indigo-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="card p-8 space-y-5">
          {step === 1 && (
            <>
              {/* Google Sign-Up button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-xl bg-white hover:bg-gray-50 hover:border-gray-300 transition-all font-medium text-gray-700 shadow-sm"
              >
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBB05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
                {t('google_signUp')}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-400">{t('google_or')}</span>
                </div>
              </div>

              {/* Step 1: Account fields */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleNext();
                }}
                className="space-y-4"
              >
                {error && (
                  <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl">{error}</div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('register_name')} *
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder={t('register_namePlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('register_email')} *
                  </label>
                  <input
                    type="email"
                    className="input-field"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('register_password')} *
                  </label>
                  <input
                    type="password"
                    className="input-field"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder={t('register_passwordPlaceholder')}
                  />
                </div>
                <button type="submit" className="btn-primary w-full">
                  {t('register_next')} →
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl">{error}</div>
              )}

              <div className="bg-indigo-50 text-indigo-700 text-sm p-3 rounded-xl">
                📦 {t('register_shippingHint')}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('register_phone')} *
                </label>
                <input
                  type="tel"
                  className="input-field"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="+380 XX XXX XX XX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('register_country')}
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder={t('register_countryPlaceholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('register_city')}
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={t('register_cityPlaceholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('register_defaultPostOffice')}
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={defaultPostOffice}
                  onChange={(e) => setDefaultPostOffice(e.target.value)}
                  placeholder={t('register_defaultPostOfficePlaceholder')}
                />
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={handleBack} className="btn-secondary flex-1">
                  ← {t('back')}
                </button>
                <button type="submit" className="btn-primary flex-1" disabled={loading}>
                  {loading ? t('register_submitting') : t('register_submit')}
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-gray-500">
            {t('register_hasAccount')}{' '}
            <Link href="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">
              {t('register_loginLink')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
