'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/LanguageContext';
import { getMediaUrl } from '@/lib/utils';
import type { Locale } from '@/i18n';
import { useState, useRef, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

const LANG_OPTIONS: { value: Locale; flag: string }[] = [
  { value: 'uk', flag: '🇺🇦' },
  { value: 'ru', flag: '🇷🇺' },
  { value: 'en', flag: '🇬🇧' },
];

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t, locale, setLocale } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Poll unread notifications count
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const data = await api.notifications.getUnreadCount();
      setUnreadCount(data.count);
    } catch {
      // silently ignore
    }
  }, [user]);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Load notifications when dropdown opens
  const openNotifications = async () => {
    setIsNotifOpen(!isNotifOpen);
    setIsMenuOpen(false);
    if (!isNotifOpen) {
      setNotifLoading(true);
      try {
        const data = await api.notifications.list();
        setNotifications(data);
      } catch {
        // ignore
      } finally {
        setNotifLoading(false);
      }
    }
  };

  const markAllRead = async () => {
    try {
      await api.notifications.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // ignore
    }
  };

  const markOneRead = async (id: string) => {
    try {
      await api.notifications.markAsRead(id);
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch {
      // ignore
    }
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  const getAvatarUrl = (url?: string) => {
    if (!url) return null;
    return getMediaUrl(url);
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'щойно';
    if (mins < 60) return `${mins} хв`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} год`;
    const days = Math.floor(hours / 24);
    return `${days} дн`;
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm bg-white/90">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6 flex-1 max-w-2xl mr-4">
          <Link
            href="/"
            className="text-xl font-bold bg-gradient-to-r from-teal-500 to-emerald-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity flex-shrink-0"
          >
            🧸 ToyShare
          </Link>

          {pathname === '/catalog' ? (
            <div className="flex-1 max-w-md hidden md:block relative">
              <SearchInput />
            </div>
          ) : (
            <div className="flex-1 hidden md:flex items-center justify-center gap-8">
              <Link
                href="/"
                className="text-sm font-medium text-gray-600 hover:text-teal-600 transition"
              >
                {t('nav_home')}
              </Link>
              <Link
                href="/catalog"
                className="text-sm font-medium text-gray-600 hover:text-teal-600 transition"
              >
                {t('nav_catalog')}
              </Link>
              <Link
                href="/#how-it-works"
                className="text-sm font-medium text-gray-600 hover:text-teal-600 transition"
              >
                {t('nav_howItWorks')}
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
            {LANG_OPTIONS.map((lang) => (
              <button
                key={lang.value}
                onClick={() => setLocale(lang.value)}
                className={`px-2 py-1 text-sm rounded-md transition-all ${
                  locale === lang.value ? 'bg-white shadow-sm font-medium' : 'hover:bg-gray-200/50'
                }`}
                title={lang.value.toUpperCase()}
              >
                {lang.flag}
              </button>
            ))}
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={openNotifications}
                  className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
                  title={t('notif_title')}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5 text-gray-600"
                  >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-sm">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900">{t('notif_title')}</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-xs text-teal-600 hover:text-teal-700 font-medium transition-colors"
                        >
                          {t('notif_markAllRead')}
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {notifLoading ? (
                        <div className="px-4 py-8 text-center text-gray-400 text-sm">
                          {t('loading')}
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-400 text-sm">
                          <span className="text-2xl block mb-2">🔔</span>
                          {t('notif_empty')}
                        </div>
                      ) : (
                        notifications.slice(0, 20).map((notif) => (
                          <button
                            key={notif.id}
                            onClick={() => {
                              if (!notif.isRead) markOneRead(notif.id);
                              setIsNotifOpen(false);
                              router.push('/exchanges');
                            }}
                            className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                              !notif.isRead ? 'bg-teal-50/50' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                                  !notif.isRead ? 'bg-teal-500' : 'bg-transparent'
                                }`}
                              />
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-sm ${!notif.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}
                                >
                                  {notif.title}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5 truncate">
                                  {notif.message}
                                </p>
                                <p className="text-[10px] text-gray-400 mt-1">
                                  {formatTime(notif.createdAt)}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => {
                    setIsMenuOpen(!isMenuOpen);
                    setIsNotifOpen(false);
                  }}
                  className="flex items-center gap-2 hover:bg-gray-50 rounded-full pl-2 pr-1 py-1 transition-colors border border-transparent hover:border-gray-100"
                >
                  <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate hidden sm:block">
                    {user.name || t('you')}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-teal-100 border border-teal-200 overflow-hidden flex items-center justify-center text-teal-600 flex-shrink-0">
                    {user.avatarUrl ? (
                      <img
                        src={getAvatarUrl(user.avatarUrl)!}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-bold text-xs">{user.name?.[0] || '👤'}</span>
                    )}
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-gray-50">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user.name || t('notSpecified')}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/profile"
                        onClick={handleLinkClick}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-teal-600 transition-colors flex items-center gap-2"
                      >
                        <span>👤</span> {t('nav_profile')}
                      </Link>
                      <Link
                        href="/dashboard"
                        onClick={handleLinkClick}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-teal-600 transition-colors flex items-center gap-2"
                      >
                        <span>🧸</span> {t('nav_myItems')}
                      </Link>
                      <Link
                        href="/exchanges"
                        onClick={handleLinkClick}
                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-teal-600 transition-colors flex items-center gap-2"
                      >
                        <span>⇄</span> {t('nav_exchanges')}
                        {unreadCount > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                        )}
                      </Link>
                      {user.role === 'ADMIN' && (
                        <Link
                          href="/admin"
                          onClick={handleLinkClick}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-teal-600 transition-colors flex items-center gap-2"
                        >
                          <span>⚙️</span> Адмінка
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-gray-50 py-1">
                      <button
                        onClick={() => {
                          logout();
                          setIsMenuOpen(false);
                          router.push('/');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                      >
                        <span>🚪</span> {t('nav_logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition px-3 py-2 rounded-lg hover:bg-gray-50"
              >
                {t('nav_login')}
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition shadow-sm hover:shadow-md"
              >
                {t('nav_register')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function SearchInput() {
  const router = useRouter();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setSearchTerm(params.get('search') || '');
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window === 'undefined') return;

      const currentParams = new URLSearchParams(window.location.search);
      const currentSearch = currentParams.get('search') || '';

      if (searchTerm !== currentSearch) {
        if (searchTerm) {
          currentParams.set('search', searchTerm);
        } else {
          currentParams.delete('search');
        }
        router.replace(`/?${currentParams.toString()}`);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm, router]);

  return (
    <>
      <input
        type="text"
        placeholder={t('catalog_searchPlaceholder') || 'Search...'}
        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <svg
        className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </>
  );
}
