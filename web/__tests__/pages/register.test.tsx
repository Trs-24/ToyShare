import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Register from '@/app/register/page';
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

const mockRegister = jest.fn();

// Mock AuthContext
jest.mock('@/context/AuthContext', () => ({
  ...jest.requireActual('@/context/AuthContext'),
  useAuth: () => ({
    register: mockRegister,
  }),
}));

const renderRegister = () => {
  return render(
    <LanguageProvider>
      <Register />
    </LanguageProvider>,
  );
};

describe('RegisterPage', () => {
  let mockRouterPush: jest.Mock;

  beforeEach(() => {
    mockRouterPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockRouterPush,
    });
    mockRegister.mockClear();
  });

  it('renders register form step 1', () => {
    renderRegister();
    // Step 1 fields
    expect(screen.getByPlaceholderText("Ваше ім'я")).toBeInTheDocument();
    expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Мінімум 6 символів')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Далі/i })).toBeInTheDocument();
  });

  it('submits form and redirects on success after both steps', async () => {
    mockRegister.mockResolvedValueOnce(undefined);
    renderRegister();

    // Step 1
    fireEvent.change(screen.getByPlaceholderText("Ваше ім'я"), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText('your@email.com'), {
      target: { value: 'test@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Мінімум 6 символів'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Далі/i }));

    // Step 2
    await waitFor(() => {
      expect(screen.getByPlaceholderText('+380 XX XXX XX XX')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('+380 XX XXX XX XX'), {
      target: { value: '+380123456789' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Зареєструватися/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@test.com',
        phone: '+380123456789',
        country: undefined,
        city: undefined,
        defaultPostOffice: undefined,
        password: 'password123',
      });
      expect(mockRouterPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows error if password is too short on step 1', async () => {
    renderRegister();

    fireEvent.change(screen.getByPlaceholderText("Ваше ім'я"), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText('your@email.com'), {
      target: { value: 'test@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Мінімум 6 символів'), {
      target: { value: 'short' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Далі/i }));

    await waitFor(() => {
      // Password too short validation error
      expect(screen.getByText(/Пароль має містити мінімум 6 символів/i)).toBeInTheDocument();
    });
  });
});
