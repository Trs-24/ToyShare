'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useTranslation } from '@/context/LanguageContext';
import { User } from '@/lib/types';

export default function AdminUsersPage() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ name: '', status: '', role: '', city: '', phone: '' });
  const [saving, setSaving] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.admin.getUsers(search || undefined);
      setUsers(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(loadUsers, 300);
    return () => clearTimeout(timer);
  }, [loadUsers]);

  const openEdit = (user: User) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || '',
      status: user.status || 'active',
      role: user.role || 'USER',
      city: user.city || '',
      phone: user.phone || '',
    });
  };

  const saveEdit = async () => {
    if (!editingUser) return;
    setSaving(true);
    try {
      await api.admin.updateUser(editingUser.id, editForm as Partial<User>);
      setEditingUser(null);
      loadUsers();
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('admin_users')}</h1>
        <p className="text-gray-500 mt-1">Manage platform users</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder={t('catalog_searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field max-w-md"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t('admin_colUser')}
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t('admin_colRole')}
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t('admin_colStatus')}
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t('profile_city')}
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t('rating_title')}
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t('admin_items')}
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t('admin_colDate')}
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t('admin_colActions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-sm font-bold text-teal-600">
                          {user.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">
                            {user.name || '—'}
                          </div>
                          <div className="text-xs text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'ADMIN'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          user.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {user.status === 'active' ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.city || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      ⭐ {(user.rating || 0).toFixed(1)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user._count?.items || 0}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openEdit(user)}
                        className="px-3 py-1.5 text-xs font-medium text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
                      >
                        ✏️ {t('edit')}
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                      {t('catalog_nothingFound')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {t('edit')}: {editingUser.name || editingUser.email}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('profile_name')}
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('profile_city')}
                </label>
                <input
                  type="text"
                  value={editForm.city}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('profile_phone')}
                </label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin_colRole')}
                  </label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="input-field"
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin_colStatus')}
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="input-field"
                  >
                    <option value="active">Active</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditingUser(null)} className="btn-secondary flex-1">
                {t('cancel')}
              </button>
              <button onClick={saveEdit} disabled={saving} className="btn-primary flex-1">
                {saving ? t('login_submitting') : t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
