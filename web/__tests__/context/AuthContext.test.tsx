import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

// Mock the API module
jest.mock('@/lib/api', () => ({
  api: {
    users: {
      getProfile: jest.fn(),
    },
    auth: {
      login: jest.fn(),
      register: jest.fn(),
    },
  },
}));

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
  const { user, token, logout } = useAuth();
  return (
    <div>
      <div data-testid="token">{token}</div>
      <div data-testid="user">{user ? user.name : 'No user'}</div>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  it('initializes with no user and null token when no token in localStorage', async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );
    });

    expect(screen.getByTestId('token')).toHaveTextContent('');
    expect(screen.getByTestId('user')).toHaveTextContent('No user');
  });

  it('loads user profile if token exists in localStorage', async () => {
    window.localStorage.setItem('token', 'test-token');
    (api.users.getProfile as jest.Mock).mockResolvedValue({ name: 'Test User' });

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );
    });

    expect(screen.getByTestId('token')).toHaveTextContent('test-token');
    expect(screen.getByTestId('user')).toHaveTextContent('Test User');
    expect(api.users.getProfile).toHaveBeenCalledTimes(1);
  });

  it('clears token and user on logout', async () => {
    window.localStorage.setItem('token', 'test-token');
    (api.users.getProfile as jest.Mock).mockResolvedValue({ name: 'Test User' });

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );
    });

    expect(screen.getByTestId('user')).toHaveTextContent('Test User');

    await act(async () => {
      screen.getByText('Logout').click();
    });

    expect(screen.getByTestId('token')).toHaveTextContent('');
    expect(screen.getByTestId('user')).toHaveTextContent('No user');
    expect(window.localStorage.getItem('token')).toBeNull();
  });
});
