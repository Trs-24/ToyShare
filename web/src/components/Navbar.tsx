'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/LanguageContext';
import { getMediaUrl } from '@/lib/utils';
import type { Locale } from '@/i18n';
import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { api } from '@/lib/api';
import SearchInput from '@/components/SearchInput';
import { ThemeToggle } from '@/components/ThemeToggle';

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

const Navbar = memo(function Navbar() {
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

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

  // Navbar scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
    if (!user) return;
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount, user]);

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
    if (mins < 1) return t('time_justNow');
    if (mins < 60) return `${mins} ${t('time_min')}`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} ${t('time_hour')}`;
    const days = Math.floor(hours / 24);
    return `${days} ${t('time_day')}`;
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6 flex-1 max-w-2xl mr-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-1.5 bg-teal-50 dark:bg-teal-900/30 rounded-xl group-hover:bg-teal-100 dark:group-hover:bg-teal-800/50 transition-colors">
              <img src="/logo.svg" alt="ToyShare" className="w-8 h-8" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">
              ToyShare
            </span>
          </Link>

          {/* Navigation Links - Always Visible */}
          <div className="flex-1 hidden md:flex items-center gap-6">
            <Link
              href="/catalog"
              className={`text-sm font-semibold px-4 py-2 rounded-full transition-all duration-300 ${
                pathname === '/catalog'
                  ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400'
                  : 'text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {t('nav_catalog')}
            </Link>
            {user && (
              <Link
                href="/profile"
                className={`text-sm font-semibold px-4 py-2 rounded-full transition-all duration-300 ${
                  pathname === '/profile'
                    ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400'
                    : 'text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {t('nav_cabinet')}
              </Link>
            )}
          </div>

          {/* Search Input - Only Visible on Catalog */}
          {pathname === '/catalog' && (
            <div className="flex-1 max-w-md hidden md:block relative ml-4">
              <SearchInput />
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />

          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
            {LANG_OPTIONS.map((lang) => (
              <button
                key={lang.value}
                onClick={() => setLocale(lang.value)}
                className={`px-2 py-1 text-sm rounded-md transition-all ${
                  locale === lang.value
                    ? 'bg-white dark:bg-gray-700 shadow-sm font-medium dark:text-white'
                    : 'hover:bg-gray-200/50 dark:hover:bg-gray-700/50 text-gray-500 dark:text-gray-400'
                }`}
                title={lang.value.toUpperCase()}
              >
                {lang.flag}
              </button>
            ))}
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              {/* Add Toy Button */}
              <Link
                href="/profile?tab=items&action=add"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white text-sm font-semibold rounded-xl hover:-translate-y-0.5 transition-all duration-300 shadow-md hover:shadow-teal-500/30"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                {t('nav_addItem')}
              </Link>

              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={openNotifications}
                  className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 hover:rotate-12"
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
                    className="w-5 h-5 text-gray-600 dark:text-gray-300"
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
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {t('notif_title')}
                      </h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-xs text-teal-600 hover:text-teal-700 font-medium transition-colors"
                        >
                          {t('notif_markAllRead')}
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-700">
                      {notifLoading ? (
                        <div className="px-4 py-8 text-center text-gray-400 dark:text-gray-500 text-sm">
                          {t('loading')}
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-400 dark:text-gray-500 text-sm">
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
                              router.push('/profile?tab=exchanges');
                            }}
                            className={`w-full text-left px-4 py-3 border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors ${
                              !notif.isRead ? 'bg-teal-50/50 dark:bg-teal-900/20' : ''
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
                                  className={`text-sm ${!notif.isRead ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}`}
                                >
                                  {notif.title}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                                  {notif.message}
                                </p>
                                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
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

              {/* User Avatar Dropdown */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => {
                    setIsMenuOpen(!isMenuOpen);
                    setIsNotifOpen(false);
                  }}
                  className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full pl-2 pr-1 py-1 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-700"
                >
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[100px] truncate hidden sm:block">
                    {user.name || t('you')}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-teal-100 border border-teal-200 overflow-hidden flex items-center justify-center text-teal-600 flex-shrink-0">
                    {user.avatarUrl && !avatarError ? (
                      <img
                        src={getAvatarUrl(user.avatarUrl)!}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                        onError={() => setAvatarError(true)}
                      />
                    ) : (
                      <span className="font-bold text-xs">{user.name?.[0] || '👤'}</span>
                    )}
                  </div>
                </button>

                {/* Simplified Dropdown — only Logout + Admin */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-gray-50 dark:border-gray-700">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {user.name || t('notSpecified')}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>

                    <div className="py-1">
                      {/* Mobile-only links */}
                      <Link
                        href="/profile"
                        onClick={handleLinkClick}
                        className="md:hidden px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex items-center gap-2"
                      >
                        <span>👤</span> {t('nav_cabinet')}
                      </Link>
                      <Link
                        href="/profile?tab=items&action=add"
                        onClick={handleLinkClick}
                        className="sm:hidden px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex items-center gap-2"
                      >
                        <span>➕</span> {t('nav_addItem')}
                      </Link>
                      {user.role === 'ADMIN' && (
                        <Link
                          href="/admin"
                          onClick={handleLinkClick}
                          className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex items-center gap-2"
                        >
                          <span>⚙️</span> Адмінка
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-gray-50 dark:border-gray-700 py-1">
                      <button
                        onClick={() => {
                          logout();
                          setIsMenuOpen(false);
                          router.push('/');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
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
                className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-300 px-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {t('nav_login')}
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white px-5 py-2 rounded-xl transition-all duration-300 shadow-md hover:shadow-teal-500/30 hover:-translate-y-0.5"
              >
                {t('nav_register')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
});

export default Navbar;
