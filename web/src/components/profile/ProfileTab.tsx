'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useTranslation } from '@/context/LanguageContext';

interface ProfileData {
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
  defaultPostOffice?: string;
  emailNotifications?: boolean;
}

interface ProfileTabProps {
  profile: ProfileData | null;
  onProfileUpdated: () => void;
}

/**
 * Profile view/edit tab — displays user info in read-only mode
 * with the ability to switch to an edit form.
 */
export default function ProfileTab({ profile, onProfileUpdated }: ProfileTabProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
    city: profile?.city || '',
    country: profile?.country || '',
    defaultPostOffice: profile?.defaultPostOffice || '',
    emailNotifications: profile?.emailNotifications ?? true,
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.users.updateProfile(profileForm);
      setIsEditing(false);
      onProfileUpdated();
      alert(t('profile_updated'));
    } catch (err) {
      console.error(err);
      alert(t('profile_updateError'));
    }
  };

  return (
    <div
      className="bg-white/90 dark:bg-slate-900/80 rounded-3xl border border-white/60 dark:border-gray-800 shadow-md p-6 md:p-8 animate-fade-in-up"
      style={{ animationDelay: '200ms' }}
    >
      {!isEditing ? (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                {t('profile_name')}
              </label>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {profile?.name || t('notSpecified')}
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                {t('profile_email')}
              </label>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {profile?.email}
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                {t('profile_phone')}
              </label>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {profile?.phone || t('notSpecified')}
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                {t('profile_city')}
              </label>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {profile?.city || t('notSpecified')}
              </p>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <label className="flex items-center gap-3 cursor-default">
              <input
                type="checkbox"
                checked={!!profile?.emailNotifications}
                readOnly
                className="w-5 h-5 rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 text-teal-500 focus:ring-teal-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t('profile_emailNotifications')}
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('profile_emailNotificationsDesc')}
                </p>
              </div>
            </label>
          </div>
          <button onClick={() => setIsEditing(true)} className="btn-primary mt-6">
            {t('profile_editBtn')}
          </button>
        </div>
      ) : (
        <form onSubmit={handleProfileUpdate} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
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
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={profileForm.emailNotifications}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, emailNotifications: e.target.checked })
                }
                className="w-5 h-5 rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 text-teal-500 focus:ring-teal-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t('profile_emailNotifications')}
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('profile_emailNotificationsDesc')}
                </p>
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
              className="px-6 py-3 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
            >
              {t('profile_cancelBtn')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
