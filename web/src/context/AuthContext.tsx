'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { api } from '@/lib/api';
import type { User, RegisterPayload } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        setToken(savedToken);
        try {
          const profile = await api.users.getProfile();
          setUser(profile);
        } catch (e) {
          console.error('Failed to fetch profile', e);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.auth.login(email, password);
    localStorage.setItem('token', data.access_token);
    setToken(data.access_token);

    const profile = await api.users.getProfile();
    setUser(profile);
  };

  const register = async (data: RegisterPayload) => {
    await api.auth.register(data);
    if (data.password) {
      await login(data.email, data.password);
    }
  };

  const loginWithToken = useCallback(async (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);

    const profile = await api.users.getProfile();
    setUser(profile);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, loginWithToken, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
