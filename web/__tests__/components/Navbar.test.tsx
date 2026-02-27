import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from '@/components/Navbar';
import { LanguageProvider } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn().mockReturnValue('/'),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock the API for notifications
jest.mock('@/lib/api', () => ({
  api: {
    notifications: {
      getUnreadCount: jest.fn().mockResolvedValue({ count: 0 }),
      list: jest.fn().mockResolvedValue([]),
    },
    users: {
      getProfile: jest.fn().mockResolvedValue({ name: 'Test User', email: 'test@example.com' }), // Prevent AuthProvider fetch error
    },
  },
}));

// Mock AuthContext entirely
const mockUseAuth = jest.fn();
jest.mock('@/context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
  AuthProvider: ({ children }: any) => <div>{children}</div>,
}));

const renderNavbarWithProviders = () => {
  return render(
    <LanguageProvider>
      <Navbar />
    </LanguageProvider>,
  );
};

describe('Navbar Component', () => {
  let mockRouterPush: jest.Mock;

  beforeEach(() => {
    mockRouterPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockRouterPush,
      replace: jest.fn(),
    });
    mockUseAuth.mockReset();
    mockUseAuth.mockReturnValue({
      user: null,
      logout: jest.fn(),
      login: jest.fn(),
      register: jest.fn(),
      token: null,
      isLoading: false,
    });
    jest.clearAllMocks();
  });

  it('renders login and register buttons when no user is logged in', () => {
    renderNavbarWithProviders();
    expect(screen.getByText('Увійти')).toBeInTheDocument(); // Expecting the fallback UK translation
    expect(screen.getByText('Реєстрація')).toBeInTheDocument();
  });

  it('renders user specific elements when user is logged in', () => {
    mockUseAuth.mockReturnValue({
      user: { name: 'Test User', email: 'test@example.com', avatarUrl: null },
      logout: jest.fn(),
      login: jest.fn(),
      register: jest.fn(),
      token: 'fake-token',
      isLoading: false,
    });

    renderNavbarWithProviders();

    // User name or initials should appear
    expect(screen.getByText('Test User')).toBeInTheDocument();

    // The notification bell title should be in document
    const bellIcon = screen.getByTitle('Сповіщення');
    expect(bellIcon).toBeInTheDocument();

    // Login/Register should not be there
    expect(screen.queryByText('Увійти')).not.toBeInTheDocument();
    expect(screen.queryByText('Реєстрація')).not.toBeInTheDocument();
  });

  it('can open language switcher and switch languages', () => {
    renderNavbarWithProviders();

    // Default is usually 'uk' depending on LanguageContext setup, but we click 'EN' flag
    const langBtn = screen.getByTitle('EN');
    fireEvent.click(langBtn);

    expect(document.documentElement.lang).toBe('en');
  });
});
