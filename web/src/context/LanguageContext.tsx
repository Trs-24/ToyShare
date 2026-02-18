'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { translations, Locale, TranslationKeys } from '@/i18n';

interface LanguageContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: TranslationKeys) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>('uk');

    useEffect(() => {
        const saved = localStorage.getItem('lang') as Locale | null;
        if (saved && translations[saved]) {
            setLocaleState(saved);
        }
    }, []);

    const setLocale = useCallback((newLocale: Locale) => {
        setLocaleState(newLocale);
        localStorage.setItem('lang', newLocale);
        document.documentElement.lang = newLocale === 'uk' ? 'uk' : newLocale === 'ru' ? 'ru' : 'en';
    }, []);

    const t = useCallback(
        (key: TranslationKeys): string => {
            return translations[locale]?.[key] || translations['uk'][key] || key;
        },
        [locale],
    );

    return (
        <LanguageContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useTranslation() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useTranslation must be used within a LanguageProvider');
    }
    return context;
}
