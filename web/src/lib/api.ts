import {
  CreateItemPayload,
  CreateExchangePayload,
  UpdateProfilePayload,
  AdminStats,
  User,
  Item,
  Exchange,
  Message,
  Notification,
} from './types';

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : '');

// ── Internal helpers ────────────────────────────────────────────────────

/** Read the JWT token from localStorage (client-side only). */
function getToken(): string | null {
  return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
}

/** Generic JSON request with auth header injection. */
async function request<T = unknown>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const fullUrl = `${API_BASE}${url}`;

  if (process.env.NODE_ENV === 'development') {
    console.log(`[API Request] ${options.method || 'GET'} ${fullUrl}`);
  }

  try {
    const res = await fetch(fullUrl, {
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
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
      console.error(
        `[API Error] Failed to fetch from ${fullUrl}. Check if NEXT_PUBLIC_API_URL is set correctly.`,
      );
      throw new Error(
        'Failed to connect to the server. Please check your internet connection or try again later.',
      );
    }
    throw error;
  }
}

/** Upload a file via multipart/form-data (used for avatars and item photos). */
async function uploadFile<T = unknown>(url: string, fieldName: string, file: File): Promise<T> {
  const token = getToken();
  const formData = new FormData();
  formData.append(fieldName, file);

  const res = await fetch(`${API_BASE}${url}`, {
    method: url.includes('avatar') ? 'PATCH' : 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) throw new Error(`Failed to upload ${fieldName}`);
  return res.json();
}

// ── Public API ──────────────────────────────────────────────────────────

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ access_token: string }>('/auth/login', {
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
    list: (filters?: Record<string, string>) => {
      const query = new URLSearchParams(filters).toString();
      return request<{ items: Item[]; total: number; totalPages: number }>(`/items?${query}`);
    },
    get: (id: string) => request<Item>(`/items/${id}`),
    create: (data: CreateItemPayload) =>
      request<Item>('/items', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<CreateItemPayload>) =>
      request<Item>(`/items/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => request(`/items/${id}`, { method: 'DELETE' }),
    uploadPhoto: (file: File) => uploadFile<{ url: string }>('/items/upload', 'photo', file),
  },

  exchanges: {
    list: () => request<Exchange[]>('/exchanges'),
    get: (id: string) => request<Exchange>(`/exchanges/${id}`),
    create: (data: CreateExchangePayload) =>
      request<Exchange>('/exchanges', { method: 'POST', body: JSON.stringify(data) }),
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
    listByExchange: (exchangeId: string) => request<Message[]>(`/messages/exchange/${exchangeId}`),
    send: (exchangeId: string, content: string) =>
      request<Message>('/messages', {
        method: 'POST',
        body: JSON.stringify({ exchangeId, content }),
      }),
    update: (id: string, content: string) =>
      request<Message>(`/messages/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ content }),
      }),
    delete: (id: string) => request(`/messages/${id}`, { method: 'DELETE' }),
  },

  users: {
    getProfile: () => request<User>('/users/profile'),
    updateProfile: (data: UpdateProfilePayload) =>
      request('/users/profile', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    uploadAvatar: (file: File) => uploadFile('/users/profile/avatar', 'avatar', file),
  },

  admin: {
    getStats: () => request<AdminStats>('/admin/stats'),
    getUsers: (search?: string) => {
      const query = search ? `?search=${encodeURIComponent(search)}` : '';
      return request<User[]>(`/admin/users${query}`);
    },
    updateUser: (id: string, data: Partial<User>) =>
      request<User>(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    getItems: (search?: string) => {
      const query = search ? `?search=${encodeURIComponent(search)}` : '';
      return request<Item[]>(`/admin/items${query}`);
    },
    updateItem: (id: string, data: Partial<Item>) =>
      request<Item>(`/admin/items/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    deleteItem: (id: string) => request(`/admin/items/${id}`, { method: 'DELETE' }),
    getExchanges: () => request<Exchange[]>('/admin/exchanges'),
  },

  notifications: {
    getUnreadCount: () => request<{ count: number }>('/notifications/unread-count'),
    list: () => request<Notification[]>('/notifications'),
    markAsRead: (id: string) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllAsRead: () => request('/notifications/read-all', { method: 'PATCH' }),
  },
};
