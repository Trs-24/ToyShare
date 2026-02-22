'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { getMediaUrl } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import {
  getCategoryOptions,
  getAgeOptions,
  getTypeOptions,
  getConditionOptions,
  getGenderOptions,
  getConditionLabel,
  getAgeLabel,
  getTypeLabel,
} from '@/constants/itemOptions';

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
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

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      api.items
        .list({ ownerId: user.id })
        .then((data) => setItems(data.items))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let newItem: any;
      if (editingId) {
        newItem = await api.items.update(editingId, form);
        setItems(items.map((i) => (i.id === editingId ? newItem : i)));
        setEditingId(null);
      } else {
        newItem = await api.items.create(form);
        setItems([newItem, ...items]);
      }
      setShowForm(false);
      setForm({
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
    } catch (err) {
      console.error(err);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const { url } = await api.items.uploadPhoto(e.target.files[0]);
        setForm((prev) => ({ ...prev, photos: [...prev.photos, url] }));
      } catch (err) {
        console.error(err);
        alert(t('dash_photoError'));
      }
    }
  };

  const removePhoto = (index: number) => {
    setForm((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const handleEdit = (item: any) => {
    setForm({
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
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('dash_deleteConfirm'))) return;
    try {
      await api.items.delete(id);
      setItems(items.filter((i) => i.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const categoryOptions = getCategoryOptions(t);
  const conditionOptions = getConditionOptions(t);
  const genderOptions = getGenderOptions(t);
  const ageOptions = getAgeOptions(t);
  const typeOptions = getTypeOptions(t);

  if (authLoading) return null;
  if (!user) return null;

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('dash_title')}</h1>
            <p className="text-gray-500 text-sm">{t('dash_subtitle')}</p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setForm({
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
            }}
            className="btn-primary"
          >
            {showForm ? t('dash_cancelBtn') : t('dash_addBtn')}
          </button>
        </div>

        {user && !user.isEmailVerified && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-amber-800 font-medium">⚠️ {t('dash_verifyEmailTitle')}</h3>
              <p className="text-amber-700 text-sm mt-1">{t('dash_verifyEmailDesc')}</p>
            </div>
          </div>
        )}

        {showForm && (
          <form onSubmit={handleCreate} className="card p-6 mb-6 space-y-4">
            <input
              className="input-field"
              placeholder={t('dash_titlePlaceholder')}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <textarea
              className="input-field"
              placeholder={t('dash_descPlaceholder')}
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  {t('dash_conditionLabel')}
                </label>
                <select
                  className="input-field"
                  value={form.condition}
                  onChange={(e) => setForm({ ...form, condition: e.target.value })}
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
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
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
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
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
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
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
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
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
              value={form.wishlist}
              onChange={(e) => setForm({ ...form, wishlist: e.target.value })}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('dash_photos')}
              </label>
              <div className="flex flex-wrap gap-4 mb-4">
                {form.photos.map((url, index) => (
                  <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden group">
                    <img
                      src={getMediaUrl(url)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
                <label className="w-24 h-24 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-teal-500 transition">
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

            <button type="submit" className="btn-primary">
              {editingId ? t('dash_saveBtn') : t('dash_publishBtn')}
            </button>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-5xl mb-4">📦</p>
            <p>{t('dash_noItems')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="card p-4 flex gap-4">
                <div className="w-20 h-20 rounded-xl bg-teal-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {item.photos?.[0] ? (
                    <img
                      src={getMediaUrl(item.photos[0].url)}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">🧸</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-1">{item.description}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="badge bg-teal-50 text-teal-700">
                      {getConditionLabel(t, item.condition)}
                    </span>
                    {item.category && (
                      <span className="badge bg-blue-50 text-blue-700">{item.category}</span>
                    )}
                    {item.age && (
                      <span className="badge bg-amber-50 text-amber-700">
                        {getAgeLabel(t, item.age)}
                      </span>
                    )}
                    {item.type && (
                      <span className="badge bg-teal-50 text-teal-700">
                        {getTypeLabel(t, item.type)}
                      </span>
                    )}
                    {['ACCEPTED', 'IN_PROGRESS'].includes(item.exchangeStatus) ? (
                      <span className="badge bg-emerald-100 text-emerald-700">
                        {t('dash_inExchange')}
                      </span>
                    ) : item.isAvailable ? (
                      <span className="badge bg-green-50 text-green-700">
                        {t('dash_available')}
                      </span>
                    ) : (
                      <span className="badge bg-gray-100 text-gray-500">{t('dash_hidden')}</span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-sm text-teal-600 hover:text-teal-800"
                    >
                      {t('dash_editItem')}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      {t('dash_deleteItem')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
