import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '@/app/login/page';
import { LanguageProvider } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock api module (needed for google login url)
jest.mock('@/lib/api', () => ({
  api: {
    auth: {
      googleLoginUrl: jest.fn(() => 'http://google.com'),
    },
  },
}));

const mockLogin = jest.fn();

jest.mock('@/context/AuthContext', () => ({
  ...jest.requireActual('@/context/AuthContext'),
  useAuth: () => ({
    login: mockLogin,
  }),
}));

const renderLogin = () => {
  return render(
    <LanguageProvider>
      <Login />
    </LanguageProvider>,
  );
};

describe('LoginPage', () => {
  let mockRouterPush: jest.Mock;

  beforeEach(() => {
    mockRouterPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockRouterPush,
    });
    mockLogin.mockClear();
  });

  it('renders login form', () => {
    renderLogin();
    expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Увійти' })).toBeInTheDocument();
  });

  it('submits form and redirects on success', async () => {
    mockLogin.mockResolvedValueOnce(undefined);
    renderLogin();

    fireEvent.change(screen.getByPlaceholderText('your@email.com'), {
      target: { value: 'test@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });

    fireEvent.submit(screen.getByRole('button', { name: 'Увійти' }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@test.com', 'password123');
      expect(mockRouterPush).toHaveBeenCalledWith('/profile');
    });
  });

  it('displays error on failed login', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));
    renderLogin();

    fireEvent.change(screen.getByPlaceholderText('your@email.com'), {
      target: { value: 'test@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrongpass' } });

    fireEvent.submit(screen.getByRole('button', { name: 'Увійти' }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@test.com', 'wrongpass');
      // err.message is rendered directly by the login page
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });
});
