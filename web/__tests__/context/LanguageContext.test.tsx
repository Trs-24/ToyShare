import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { LanguageProvider, useTranslation } from '@/context/LanguageContext';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

const TestComponent = () => {
  const { locale, setLocale, t } = useTranslation();
  return (
    <div>
      <div data-testid="locale">{locale}</div>
      <div data-testid="translated">{t('welcome')}</div>
      <button onClick={() => setLocale('en')}>Switch EN</button>
      <button onClick={() => setLocale('ru')}>Switch RU</button>
    </div>
  );
};

// Assuming translations contains 'welcome'
jest.mock('@/i18n', () => ({
  translations: {
    uk: { welcome: 'Ласкаво просимо' },
    en: { welcome: 'Welcome' },
    ru: { welcome: 'Добро пожаловать' },
  },
}));

describe('LanguageContext', () => {
  beforeEach(() => {
    window.localStorage.clear();
    // Reset document lang
    document.documentElement.lang = 'en';
  });

  it('defaults to uk locale', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>,
    );
    expect(screen.getByTestId('locale')).toHaveTextContent('uk');
    expect(screen.getByTestId('translated')).toHaveTextContent('Ласкаво просимо');
  });

  it('loads locale from localStorage if available', () => {
    window.localStorage.setItem('lang', 'en');
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>,
    );
    expect(screen.getByTestId('locale')).toHaveTextContent('en');
    expect(screen.getByTestId('translated')).toHaveTextContent('Welcome');
  });

  it('updates locale and translated text when setLocale is called', async () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>,
    );

    expect(screen.getByTestId('locale')).toHaveTextContent('uk');

    await act(async () => {
      screen.getByText('Switch EN').click();
    });

    expect(screen.getByTestId('locale')).toHaveTextContent('en');
    expect(screen.getByTestId('translated')).toHaveTextContent('Welcome');
    expect(window.localStorage.getItem('lang')).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });
});
