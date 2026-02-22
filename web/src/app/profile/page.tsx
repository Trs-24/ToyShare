'use client';

import { Suspense, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/LanguageContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { api } from '@/lib/api';
import { getMediaUrl } from '@/lib/utils';
import {
  getCategoryOptions,
  getAgeOptions,
  getTypeOptions,
  getConditionOptions,
  getGenderOptions,
  getConditionLabel,
  getAgeLabel,
  getTypeLabel,
  getCategoryLabel,
} from '@/constants/itemOptions';

type TabType = 'profile' | 'items' | 'exchanges';

export default function CabinetPageWrapper() {
  return (
    <Suspense
      fallback={
        <>
          <Navbar />
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
          </div>
        </>
      }
    >
      <CabinetPage />
    </Suspense>
  );
}

function CabinetPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Tab state from URL
  const tabParam = searchParams.get('tab') as TabType | null;
  const [activeTab, setActiveTab] = useState<TabType>(tabParam || 'profile');

  // Profile state
  const [profile, setProfile] = useState<any>(null);
  const [, setProfileLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    city: '',
    country: '',
    defaultPostOffice: '',
    emailNotifications: true,
  });

  // Items state
  const [items, setItems] = useState<any[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState({
    title: '',
    description: '',
    condition: 'GOOD',
    category: '',
    gender: '',
    age: '',
    type: '',
    wishlist: '',
    photos: [] as string[],
  });

  // Sync tab from URL
  useEffect(() => {
    const tab = searchParams.get('tab') as TabType | null;
    if (tab && ['profile', 'items', 'exchanges'].includes(tab)) {
      setActiveTab(tab);
    }
    if (searchParams.get('action') === 'add' && tab === 'items') {
      setShowItemForm(true);
      setEditingId(null);
      resetItemForm();
    }
  }, [searchParams]);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Load profile
  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  // Load items when items tab is active
  useEffect(() => {
    if (user && activeTab === 'items') {
      fetchItems();
    }
  }, [user, activeTab]);

  // Redirect to exchanges page when exchanges tab
  useEffect(() => {
    if (activeTab === 'exchanges') {
      router.push('/exchanges');
    }
  }, [activeTab]);

  const fetchProfile = async () => {
    try {
      const data = await api.users.getProfile();
      setProfile(data);
      setProfileForm({
        name: data.name || '',
        phone: data.phone || '',
        city: data.city || '',
        country: data.country || '',
        defaultPostOffice: data.defaultPostOffice || '',
        emailNotifications: data.emailNotifications ?? true,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchItems = async () => {
    if (!user) return;
    try {
      const data = await api.items.list({ ownerId: user.id });
      setItems(data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setItemsLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.users.updateProfile(profileForm);
      setIsEditing(false);
      fetchProfile();
      alert(t('profile_updated'));
    } catch (err) {
      console.error(err);
      alert(t('profile_updateError'));
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        await api.users.uploadAvatar(e.target.files[0]);
        fetchProfile();
      } catch (err) {
        console.error(err);
        alert(t('profile_photoError'));
      }
    }
  };

  const resetItemForm = () => {
    setItemForm({
      title: '',
      description: '',
      condition: 'GOOD',
      category: '',
      gender: '',
      age: '',
      type: '',
      wishlist: '',
      photos: [],
    });
  };

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const updated = await api.items.update(editingId, itemForm);
        setItems(items.map((i) => (i.id === editingId ? updated : i)));
        setEditingId(null);
      } else {
        const created = await api.items.create(itemForm);
        setItems([created, ...items]);
      }
      setShowItemForm(false);
      resetItemForm();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const { url } = await api.items.uploadPhoto(e.target.files[0]);
        setItemForm((prev) => ({ ...prev, photos: [...prev.photos, url] }));
      } catch (err) {
        console.error(err);
        alert(t('dash_photoError'));
      }
    }
  };

  const removePhoto = (index: number) => {
    setItemForm((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const handleEditItem = (item: any) => {
    setItemForm({
      title: item.title,
      description: item.description,
      condition: item.condition,
      category: item.category || '',
      gender: item.gender || '',
      age: item.age || '',
      type: item.type || '',
      wishlist: item.wishlist || '',
      photos: item.photos?.map((p: any) => p.url) || [],
    });
    setEditingId(item.id);
    setShowItemForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm(t('dash_deleteConfirm'))) return;
    try {
      await api.items.delete(id);
      setItems(items.filter((i) => i.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const switchTab = (tab: TabType) => {
    setActiveTab(tab);
    router.replace(`/profile?tab=${tab}`, { scroll: false });
  };

  const categoryOptions = getCategoryOptions(t);
  const conditionOptions = getConditionOptions(t);
  const genderOptions = getGenderOptions(t);
  const ageOptions = getAgeOptions(t);
  const typeOptions = getTypeOptions(t);

  if (authLoading) return null;
  if (!user) return null;

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'profile', label: t('cabinet_tab_profile'), icon: '👤' },
    { key: 'items', label: t('cabinet_tab_items'), icon: '🧸' },
    { key: 'exchanges', label: t('cabinet_tab_exchanges'), icon: '⇄' },
  ];

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
        <div className="flex gap-1 bg-gray-100 rounded-2xl p-1.5 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => switchTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-teal-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* === PROFILE TAB === */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
            {!isEditing ? (
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {t('profile_name')}
                    </label>
                    <p className="text-lg font-semibold text-gray-900">
                      {profile?.name || t('notSpecified')}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {t('profile_email')}
                    </label>
                    <p className="text-lg font-semibold text-gray-900">{profile?.email}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {t('profile_phone')}
                    </label>
                    <p className="text-lg font-semibold text-gray-900">
                      {profile?.phone || t('notSpecified')}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {t('profile_city')}
                    </label>
                    <p className="text-lg font-semibold text-gray-900">
                      {profile?.city || t('notSpecified')}
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <label className="flex items-center gap-3 cursor-default">
                    <input
                      type="checkbox"
                      checked={profile?.emailNotifications}
                      readOnly
                      className="w-5 h-5 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">
                        {t('profile_emailNotifications')}
                      </span>
                      <p className="text-xs text-gray-500">{t('profile_emailNotificationsDesc')}</p>
                    </div>
                  </label>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 transition-colors shadow-sm"
                >
                  {t('profile_editBtn')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleProfileUpdate} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t('profile_name')}
                    </label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t('register_phone')}
                    </label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t('register_city')}
                    </label>
                    <input
                      type="text"
                      value={profileForm.city}
                      onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t('register_defaultPostOffice')}
                    </label>
                    <input
                      type="text"
                      value={profileForm.defaultPostOffice}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, defaultPostOffice: e.target.value })
                      }
                      className="input-field"
                    />
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profileForm.emailNotifications}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, emailNotifications: e.target.checked })
                      }
                      className="w-5 h-5 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">
                        {t('profile_emailNotifications')}
                      </span>
                      <p className="text-xs text-gray-500">{t('profile_emailNotificationsDesc')}</p>
                    </div>
                  </label>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 transition-colors shadow-sm"
                  >
                    {t('profile_saveBtn')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    {t('profile_cancelBtn')}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* === MY ITEMS TAB === */}
        {activeTab === 'items' && (
          <div>
            {/* Add/Edit Item Form */}
            {showItemForm && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  {editingId ? t('dash_editItem') : t('nav_addItem')}
                </h2>
                <form onSubmit={handleItemSubmit} className="space-y-5">
                  <input
                    className="input-field"
                    placeholder={t('dash_titlePlaceholder')}
                    value={itemForm.title}
                    onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
                    required
                  />
                  <textarea
                    className="input-field"
                    placeholder={t('dash_descPlaceholder')}
                    rows={3}
                    value={itemForm.description}
                    onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        {t('dash_conditionLabel')}
                      </label>
                      <select
                        className="input-field"
                        value={itemForm.condition}
                        onChange={(e) => setItemForm({ ...itemForm, condition: e.target.value })}
                      >
                        {conditionOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        {t('dash_categoryLabel')}
                      </label>
                      <select
                        className="input-field"
                        value={itemForm.category}
                        onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                      >
                        {categoryOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        {t('dash_genderLabel')}
                      </label>
                      <select
                        className="input-field"
                        value={itemForm.gender}
                        onChange={(e) => setItemForm({ ...itemForm, gender: e.target.value })}
                      >
                        {genderOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        {t('dash_ageLabel')}
                      </label>
                      <select
                        className="input-field"
                        value={itemForm.age}
                        onChange={(e) => setItemForm({ ...itemForm, age: e.target.value })}
                      >
                        {ageOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        {t('dash_typeLabel')}
                      </label>
                      <select
                        className="input-field"
                        value={itemForm.type}
                        onChange={(e) => setItemForm({ ...itemForm, type: e.target.value })}
                      >
                        {typeOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <input
                    className="input-field"
                    placeholder={t('dash_wishlistPlaceholder')}
                    value={itemForm.wishlist}
                    onChange={(e) => setItemForm({ ...itemForm, wishlist: e.target.value })}
                  />
                  {/* Photos */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('dash_photos')}
                    </label>
                    <div className="flex flex-wrap gap-4">
                      {itemForm.photos.map((url, index) => (
                        <div
                          key={index}
                          className="relative w-24 h-24 rounded-xl overflow-hidden group"
                        >
                          <img
                            src={getMediaUrl(url)}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <label className="w-24 h-24 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-teal-500 transition">
                        <span className="text-2xl text-gray-400">+</span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 transition-colors shadow-sm"
                    >
                      {editingId ? t('dash_saveBtn') : t('dash_publishBtn')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowItemForm(false);
                        setEditingId(null);
                        resetItemForm();
                      }}
                      className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      {t('profile_cancelBtn')}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Add button */}
            {!showItemForm && (
              <div className="flex justify-end mb-6">
                <button
                  onClick={() => {
                    setShowItemForm(true);
                    setEditingId(null);
                    resetItemForm();
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 transition-colors shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  {t('nav_addItem')}
                </button>
              </div>
            )}

            {/* Items Grid — catalog style */}
            {itemsLoading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-5xl mb-4">📦</p>
                <p className="text-lg">{t('dash_noItems')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Photo */}
                    <Link href={`/items/${item.id}`} className="block">
                      <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden">
                        {item.photos?.[0] ? (
                          <img
                            src={getMediaUrl(item.photos[0].url)}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl opacity-40">
                            🧸
                          </div>
                        )}
                        {/* Status badge */}
                        <div className="absolute top-3 left-3">
                          {['ACCEPTED', 'IN_PROGRESS'].includes(item.exchangeStatus) ? (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/90 text-white text-[11px] font-bold">
                              {t('dash_inExchange')}
                            </span>
                          ) : item.isAvailable ? (
                            <span className="px-2.5 py-1 rounded-lg bg-green-500/90 text-white text-[11px] font-bold">
                              {t('dash_available')}
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg bg-gray-500/90 text-white text-[11px] font-bold">
                              {t('dash_hidden')}
                            </span>
                          )}
                        </div>
                        {/* Type badge */}
                        {item.type && (
                          <div className="absolute top-3 right-3">
                            <span className="px-2.5 py-1 rounded-lg bg-teal-500/90 text-white text-[11px] font-bold">
                              {getTypeLabel(t, item.type)}
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 line-clamp-1 mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-1 mb-3">{item.description}</p>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[11px] font-medium">
                          {getConditionLabel(t, item.condition)}
                        </span>
                        {item.category && (
                          <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 text-[11px] font-medium">
                            {getCategoryLabel(t, item.category)}
                          </span>
                        )}
                        {item.age && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[11px] font-medium">
                            {getAgeLabel(t, item.age)}
                          </span>
                        )}
                      </div>
                      {/* Action buttons */}
                      <div className="flex gap-2 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => handleEditItem(item)}
                          className="flex-1 px-3 py-2 text-sm font-semibold text-teal-600 bg-teal-50 rounded-xl hover:bg-teal-100 transition-colors"
                        >
                          {t('dash_editItem')}
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="flex-1 px-3 py-2 text-sm font-semibold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                        >
                          {t('dash_deleteItem')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
