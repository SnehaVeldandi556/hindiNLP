'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from './api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  ward?: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, ward?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('shikayat_token');
    const storedUser = localStorage.getItem('shikayat_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('shikayat_token');
        localStorage.removeItem('shikayat_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.auth.login({ email, password });
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('shikayat_token', data.access_token);
    localStorage.setItem('shikayat_user', JSON.stringify(data.user));
  };

  const register = async (name: string, email: string, password: string, ward?: string) => {
    const data = await api.auth.register({ name, email, password, ward });
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('shikayat_token', data.access_token);
    localStorage.setItem('shikayat_user', JSON.stringify(data.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('shikayat_token');
    localStorage.removeItem('shikayat_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
