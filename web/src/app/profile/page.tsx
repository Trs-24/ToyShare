'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/LanguageContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { api } from '@/lib/api';
import { getMediaUrl } from '@/lib/utils';
import ProfileTab from '@/components/profile/ProfileTab';
import ItemsTab from '@/components/profile/ItemsTab';
import ExchangesTab from '@/components/profile/ExchangesTab';

type TabType = 'profile' | 'items' | 'exchanges';

/**
 * Suspense wrapper for CabinetPage (useSearchParams requires it).
 */
export default function CabinetPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500" />
        </div>
      }
    >
      <CabinetPage />
    </Suspense>
  );
}

/**
 * Profile / Cabinet page — slim orchestrator.
 * Delegates content to ProfileTab, ItemsTab, and ExchangesTab.
 */
function CabinetPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Tab state from URL
  const tabParam = searchParams.get('tab') as TabType | null;
  const [activeTab, setActiveTab] = useState<TabType>(tabParam || 'profile');

  // Profile data (shared between hero banner and ProfileTab)
  const [profile, setProfile] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);

  // Sync tab from URL
  useEffect(() => {
    const tab = searchParams.get('tab') as TabType | null;
    if (tab && ['profile', 'items', 'exchanges'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  // Fetch profile
  const fetchProfile = useCallback(async () => {
    try {
      const data = await api.users.getProfile();
      setProfile(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Fetch items (for the count in the hero banner)
  const fetchItems = useCallback(async () => {
    if (!user) return;
    try {
      const data = await api.items.list({ ownerId: user.id });
      setItems(data.items);
    } catch (err) {
      console.error(err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchItems();
    }
  }, [user, fetchProfile, fetchItems]);

  const switchTab = (tab: TabType) => {
    setActiveTab(tab);
    router.replace(`/profile?tab=${tab}`, { scroll: false });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      try {
        await api.users.uploadAvatar(e.target.files[0]);
        fetchProfile();
      } catch (err) {
        console.error(err);
        alert(t('profile_photoError'));
      }
    }
  };

  if (authLoading || !user) return null;

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'profile', label: t('cabinet_tab_profile'), icon: '👤' },
    { key: 'items', label: t('cabinet_tab_items'), icon: '🧸' },
    { key: 'exchanges', label: t('cabinet_tab_exchanges'), icon: '⇄' },
  ];

  const openFormFromUrl = searchParams.get('action') === 'add' && activeTab === 'items';

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-3xl p-8 md:p-10 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white/20 overflow-hidden border-4 border-white/30 shadow-lg">
                {profile?.avatarUrl ? (
                  <img
                    src={getMediaUrl(profile.avatarUrl)}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl">👤</div>
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xs font-bold rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                📷
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                />
              </label>
            </div>
            {/* User Info */}
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                {profile?.name || t('notSpecified')}
              </h1>
              <p className="text-white/80 text-sm mt-1 flex items-center gap-1.5 justify-center sm:justify-start">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                {profile?.email}
                {profile?.isEmailVerified ? (
                  <span className="ml-1" title="Verified">
                    ✅
                  </span>
                ) : (
                  <span className="ml-1 text-yellow-200" title="Not verified">
                    ⏳
                  </span>
                )}
              </p>
              {profile?.city && (
                <p className="text-white/70 text-sm mt-0.5 flex items-center gap-1.5 justify-center sm:justify-start">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  {profile.city}
                </p>
              )}
              <div className="flex gap-4 mt-3 text-white/90 text-sm font-medium justify-center sm:justify-start">
                <span>
                  {items.length} {t('cabinet_tab_items').toLowerCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          className="flex gap-2 bg-white/80 dark:bg-slate-900/80 rounded-2xl p-1.5 mb-8 border border-gray-100/50 dark:border-gray-800 shadow-sm animate-fade-in-up"
          style={{ animationDelay: '100ms' }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => switchTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === tab.key
                  ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-md transform scale-[1.02]'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <ProfileTab profile={profile} onProfileUpdated={fetchProfile} />
        )}
        {activeTab === 'items' && <ItemsTab initialItems={items} openForm={openFormFromUrl} />}
        {activeTab === 'exchanges' && <ExchangesTab />}
      </main>
    </>
  );
}
