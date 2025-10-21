import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../../../server-app/shared/schema';
import { api } from '../lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => void;
  loginWithEmail: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => void;
  logout: () => void;
  refetchUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const userData = await api.auth.getUser();
      if (userData) {
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      // Only log non-auth errors
      if (error.message !== 'Not authenticated') {
        console.error('Auth check failed:', error);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    api.auth.googleLogin();
  };

  const loginWithEmail = async (email: string, password: string): Promise<boolean> => {
    try {
      const userData = await api.auth.login(email, password);
      setUser(userData);
      return true;
    } catch (error) {
      console.error('Email login failed:', error);
      return false;
    }
  };

  const loginWithGoogle = () => {
    api.auth.googleLogin();
  };

  const logout = async () => {
    try {
      await api.auth.logout();
      setUser(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      setUser(null);
      window.location.href = '/';
    }
  };

  const refetchUser = async () => {
    await checkAuthStatus();
  };

  const value = {
    user,
    loading,
    login,
    loginWithEmail,
    loginWithGoogle,
    logout,
    refetchUser,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};