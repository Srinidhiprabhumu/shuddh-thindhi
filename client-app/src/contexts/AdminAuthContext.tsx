import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

interface AdminAuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const adminData = await api.admin.getMe();
      if (adminData) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      // Only log non-auth errors
      if (error.message !== 'Not authenticated') {
        console.error('Admin auth check failed:', error);
      }
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      await api.admin.login(username, password);
      
      // Wait a bit for session to be established, then verify with server
      await new Promise(resolve => setTimeout(resolve, 100));
      
      try {
        await api.admin.getMe();
        setIsAuthenticated(true);
        return true;
      } catch (verifyError) {
        console.error('Admin verification failed:', verifyError);
        return false;
      }
    } catch (error) {
      console.error('Admin login failed:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.admin.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    isAuthenticated,
    loading,
    login,
    logout,
    checkAuth
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};