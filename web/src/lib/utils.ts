/**
 * Shared utility functions for the ToyShare frontend.
 */

import { API_BASE } from './api';

/**
 * Resolves a media URL (photo, avatar) to an absolute URL.
 * Handles both full URLs (e.g. from Google OAuth) and relative paths
 * (e.g. `/uploads/items/photo.jpg` from the backend).
 */
export function getMediaUrl(url: string): string {
  if (!url) return '';
  return url.startsWith('http') ? url : `${API_BASE}${url}`;
}

/**
 * Maps the app locale code to a standard BCP 47 locale string
 * for use with `toLocaleDateString()` / `toLocaleTimeString()`.
 */
export function getDateLocale(locale: string): string {
  switch (locale) {
    case 'uk':
      return 'uk-UA';
    case 'ru':
      return 'ru-RU';
    default:
      return 'en-US';
  }
}

/**
 * Returns a Tailwind CSS class string for an exchange status badge.
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'PROPOSED':
      return 'bg-blue-50 text-blue-700';
    case 'ACCEPTED':
      return 'bg-green-50 text-green-700';
    case 'IN_PROGRESS':
      return 'bg-emerald-50 text-emerald-700';
    case 'COMPLETED':
      return 'bg-emerald-50 text-emerald-700';
    case 'REJECTED':
      return 'bg-red-50 text-red-700';
    case 'CANCELLED':
      return 'bg-gray-50 text-gray-700';
    default:
      return 'bg-gray-50 text-gray-700';
  }
}
