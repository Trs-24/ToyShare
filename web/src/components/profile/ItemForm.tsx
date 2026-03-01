'use client';

import { useState } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { api } from '@/lib/api';
import { getMediaUrl } from '@/lib/utils';
import {
  getCategoryOptions,
  getConditionOptions,
  getGenderOptions,
  getAgeOptions,
  getTypeOptions,
} from '@/constants/itemOptions';

export interface ItemFormData {
  title: string;
  description: string;
  condition: string;
  category: string;
  gender: string;
  age: string;
  type: string;
  wishlist: string;
  photos: string[];
}

interface ItemFormProps {
  editingId: string | null;
  initialData: ItemFormData;
  onSave: (item: any) => void;
  onCancel: () => void;
}

/**
 * Form for creating or editing an item.
 * Handles photo uploads, select fields, and form submission.
 */
export default function ItemForm({ editingId, initialData, onSave, onCancel }: ItemFormProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState(initialData);

  const categoryOptions = getCategoryOptions(t);
  const conditionOptions = getConditionOptions(t);
  const genderOptions = getGenderOptions(t);
  const ageOptions = getAgeOptions(t);
  const typeOptions = getTypeOptions(t);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = editingId
        ? await api.items.update(editingId, form)
        : await api.items.create(form);
      onSave(result);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
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
    setForm((prev) => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
  };

  return (
    <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 md:p-8 mb-8">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        {editingId ? t('dash_editItem') : t('nav_addItem')}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
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

        {/* Condition + Category */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {t('dash_conditionLabel')}
            </label>
            <select
              className="input-field"
              value={form.condition}
              onChange={(e) => setForm({ ...form, condition: e.target.value })}
            >
              {conditionOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {t('dash_categoryLabel')}
            </label>
            <select
              className="input-field"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {categoryOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Gender + Age + Type */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {t('dash_genderLabel')}
            </label>
            <select
              className="input-field"
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
            >
              {genderOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {t('dash_ageLabel')}
            </label>
            <select
              className="input-field"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
            >
              {ageOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {t('dash_typeLabel')}
            </label>
            <select
              className="input-field"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              {typeOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
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

        {/* Photos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('dash_photos')}
          </label>
          <div className="flex flex-wrap gap-4">
            {form.photos.map((url, i) => (
              <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden group">
                <img src={getMediaUrl(url)} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                >
                  ✕
                </button>
              </div>
            ))}
            <label className="w-24 h-24 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:border-teal-500 dark:hover:border-teal-400 transition bg-white dark:bg-slate-800">
              <span className="text-2xl text-gray-400 dark:text-gray-500">+</span>
              <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 transition-colors shadow-sm"
          >
            {editingId ? t('dash_saveBtn') : t('dash_publishBtn')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
          >
            {t('profile_cancelBtn')}
          </button>
        </div>
      </form>
    </div>
  );
}
