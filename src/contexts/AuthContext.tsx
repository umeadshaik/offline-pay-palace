import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getAuthData,
  validateSession,
  verifyPin,
  logout as authLogout,
  createAccount,
  extendSession,
  resetAccount,
  type AuthData
} from '@/lib/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  authData: AuthData | null;
  login: (pin: string) => Promise<{ success: boolean; message: string }>;
  signup: (mobileNumber: string, pin: string) => Promise<AuthData>;
  logout: () => void;
  reset: () => void;
  refreshAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authData, setAuthData] = useState<AuthData | null>(null);

  // Check session on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Extend session on user activity
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleActivity = () => {
      extendSession();
    };

    window.addEventListener('click', handleActivity);
    window.addEventListener('keypress', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    return () => {
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keypress', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, [isAuthenticated]);

  const checkAuth = useCallback(() => {
    setIsLoading(true);
    const data = getAuthData();
    const valid = validateSession();
    
    setAuthData(data);
    setIsAuthenticated(valid);
    setIsLoading(false);
  }, []);

  const login = useCallback(async (pin: string) => {
    const result = await verifyPin(pin);
    if (result.success) {
      checkAuth();
    }
    return result;
  }, [checkAuth]);

  const signup = useCallback(async (mobileNumber: string, pin: string) => {
    const data = await createAccount(mobileNumber, pin);
    setAuthData(data);
    setIsAuthenticated(true);
    return data;
  }, []);

  const logout = useCallback(() => {
    authLogout();
    setIsAuthenticated(false);
    // Keep authData for "returning user" detection
    setAuthData(getAuthData());
  }, []);

  const reset = useCallback(() => {
    resetAccount();
    setAuthData(null);
    setIsAuthenticated(false);
  }, []);

  const refreshAuth = useCallback(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        authData,
        login,
        signup,
        logout,
        reset,
        refreshAuth,
      }}
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
