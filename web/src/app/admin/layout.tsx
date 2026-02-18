'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useTranslation } from '@/context/LanguageContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const { t } = useTranslation();

    const navItems = [
        { href: '/admin', label: `📊 ${t('admin_dashboard')}` },
        { href: '/admin/users', label: `👥 ${t('admin_users')}` },
        { href: '/admin/items', label: `🧸 ${t('admin_items')}` },
        { href: '/admin/exchanges', label: `🔄 ${t('admin_exchanges')}` },
    ];

    useEffect(() => {
        if (!isLoading && (!user || user.role !== 'ADMIN')) {
            router.push('/');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (!user || user.role !== 'ADMIN') return null;

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-white flex flex-col shrink-0">
                <div className="p-6 border-b border-gray-700">
                    <Link href="/" className="flex items-center gap-2 text-white no-underline">
                        <span className="text-2xl">🧸</span>
                        <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            ToyShare
                        </span>
                    </Link>
                    <p className="text-gray-400 text-xs mt-1">{t('admin_title')}</p>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive =
                            item.href === '/admin'
                                ? pathname === '/admin'
                                : pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 no-underline ${isActive
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                    }`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-700">
                    <div className="flex items-center gap-3 px-4 py-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold">
                            {user.name?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user.name}</p>
                            <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        </div>
                    </div>
                    <Link
                        href="/"
                        className="block mt-3 px-4 py-2 text-xs text-gray-400 hover:text-white transition-colors no-underline"
                    >
                        {t('admin_backToSite')}
                    </Link>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-auto">
                <div className="p-8">{children}</div>
            </main>
        </div>
    );
}
