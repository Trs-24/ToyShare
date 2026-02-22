const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function request(url: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || 'API Error');
  }
  return res.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    register: (data: {
      email: string;
      password?: string;
      name: string;
      phone: string;
      city?: string;
      country?: string;
      defaultPostOffice?: string;
    }) =>
      request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    verifyEmail: (token: string) => request(`/auth/verify-email?token=${token}`),
    googleLoginUrl: () => `${API_BASE}/auth/google`,
  },
  items: {
    list: (filters?: any) => {
      const query = new URLSearchParams(filters).toString();
      return request(`/items?${query}`);
    },
    get: (id: string) => request(`/items/${id}`),
    create: (data: any) => request('/items', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request(`/items/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => request(`/items/${id}`, { method: 'DELETE' }),
    uploadPhoto: (file: File) => {
      const formData = new FormData();
      formData.append('photo', file);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      return fetch(`${API_BASE}/items/upload`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      }).then(async (res) => {
        if (!res.ok) throw new Error('Failed to upload photo');
        return res.json();
      });
    },
  },
  exchanges: {
    list: () => request('/exchanges'),
    get: (id: string) => request(`/exchanges/${id}`),
    create: (data: any) => request('/exchanges', { method: 'POST', body: JSON.stringify(data) }),
    updateStatus: (id: string, status: string) =>
      request(`/exchanges/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    updateOffer: (id: string, itemOfferedId: string) =>
      request(`/exchanges/${id}/offer`, {
        method: 'PATCH',
        body: JSON.stringify({ itemOfferedId }),
      }),
    updateShipping: (
      id: string,
      data: { meetingDate?: string; postOffice?: string; shippingNote?: string },
    ) =>
      request(`/exchanges/${id}/shipping`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    cancel: (id: string) => request(`/exchanges/${id}`, { method: 'DELETE' }),
    createRating: (id: string, data: { score: number; comment?: string }) =>
      request(`/exchanges/${id}/rating`, { method: 'POST', body: JSON.stringify(data) }),
    getRatings: (id: string) => request(`/exchanges/${id}/rating`),
    confirmShipping: (id: string) =>
      request(`/exchanges/${id}/confirm-shipping`, { method: 'PATCH' }),
  },
  messages: {
    listByExchange: (exchangeId: string) => request(`/messages/exchange/${exchangeId}`),
    send: (exchangeId: string, content: string) =>
      request('/messages', {
        method: 'POST',
        body: JSON.stringify({ exchangeId, content }),
      }),
    update: (id: string, content: string) =>
      request(`/messages/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ content }),
      }),
    delete: (id: string) => request(`/messages/${id}`, { method: 'DELETE' }),
  },
  users: {
    getProfile: () => request('/users/profile'),
    updateProfile: (data: any) =>
      request('/users/profile', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    uploadAvatar: (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      return fetch(`${API_BASE}/users/profile/avatar`, {
        method: 'PATCH',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      }).then(async (res) => {
        if (!res.ok) throw new Error('Failed to upload avatar');
        return res.json();
      });
    },
  },
  admin: {
    getStats: () => request('/admin/stats'),
    getUsers: (search?: string) => {
      const query = search ? `?search=${encodeURIComponent(search)}` : '';
      return request(`/admin/users${query}`);
    },
    updateUser: (id: string, data: any) =>
      request(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    getItems: (search?: string) => {
      const query = search ? `?search=${encodeURIComponent(search)}` : '';
      return request(`/admin/items${query}`);
    },
    updateItem: (id: string, data: any) =>
      request(`/admin/items/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    deleteItem: (id: string) => request(`/admin/items/${id}`, { method: 'DELETE' }),
    getExchanges: () => request('/admin/exchanges'),
  },
  notifications: {
    getUnreadCount: () => request('/notifications/unread-count'),
    list: () => request('/notifications'),
    markAsRead: (id: string) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllAsRead: () => request('/notifications/read-all', { method: 'PATCH' }),
  },
};
