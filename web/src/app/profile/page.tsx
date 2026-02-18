'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { api } from '@/lib/api';
import { getMediaUrl } from '@/lib/utils';

export default function ProfilePage() {
    const { user } = useAuth();
    const { t } = useTranslation();
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState({
        name: '',
        phone: '',
        city: '',
    });

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }
        fetchProfile();
    }, [user]);

    const fetchProfile = async () => {
        try {
            const data = await api.users.getProfile();
            setProfile(data);
            setForm({
                name: data.name || '',
                phone: data.phone || '',
                city: data.city || '',
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.users.updateProfile(form);
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

    if (loading) return <div>{t('loading')}</div>;

    return (
        <>
            <Navbar />
            <main className="max-w-2xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">{t('profile_title')}</h1>

                <div className="card p-6 flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden relative">
                            {profile?.avatarUrl ? (
                                <img src={getMediaUrl(profile.avatarUrl)} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl">👤</div>
                            )}
                        </div>
                        <label className="btn-secondary cursor-pointer">
                            {t('profile_changePhoto')}
                            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                        </label>
                    </div>

                    <div className="flex-1 w-full">
                        {!isEditing ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-gray-500">{t('profile_name')}</label>
                                    <p className="text-lg font-medium">{profile?.name || t('notSpecified')}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">{t('profile_email')}</label>
                                    <p className="text-lg font-medium">{profile?.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">{t('profile_phone')}</label>
                                    <p className="text-lg font-medium">{profile?.phone || t('notSpecified')}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">{t('profile_city')}</label>
                                    <p className="text-lg font-medium">{profile?.city || t('notSpecified')}</p>
                                </div>
                                <button onClick={() => setIsEditing(true)} className="btn-primary mt-4">
                                    {t('profile_editBtn')}
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{t('profile_name')}</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="input-field mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{t('profile_phone')}</label>
                                    <input
                                        type="tel"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        className="input-field mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{t('profile_city')}</label>
                                    <input
                                        type="text"
                                        value={form.city}
                                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                                        className="input-field mt-1"
                                    />
                                </div>
                                <div className="flex gap-4 mt-6">
                                    <button type="submit" className="btn-primary">{t('profile_saveBtn')}</button>
                                    <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">
                                        {t('profile_cancelBtn')}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}
