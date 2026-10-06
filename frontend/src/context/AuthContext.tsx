import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role, LoginPayload, RegisterPayload } from '../types';
import * as authApi from '../api/auth';
import { mockUsers } from '../mock/mockData';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => void;
  switchRolePreview: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('campuspulse_user');
    return saved ? JSON.parse(saved) : mockUsers.student;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('campuspulse_token') || 'demo_token_student';
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('campuspulse_token');
      if (storedToken) {
        try {
          const currentUser = await authApi.getMe();
          setUser(currentUser);
          localStorage.setItem('campuspulse_user', JSON.stringify(currentUser));
        } catch {
          // Keep current user state or fallback gracefully
        }
      }
      setIsLoading(false);
    };

    initAuth();

    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('campuspulse:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('campuspulse:unauthorized', handleUnauthorized);
  }, []);

  const login = async (payload: LoginPayload): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await authApi.login(payload);
      localStorage.setItem('campuspulse_token', response.access_token);
      localStorage.setItem('campuspulse_user', JSON.stringify(response.user));
      setToken(response.access_token);
      setUser(response.user);
      return response.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await authApi.register(payload);
      localStorage.setItem('campuspulse_token', response.access_token);
      localStorage.setItem('campuspulse_user', JSON.stringify(response.user));
      setToken(response.access_token);
      setUser(response.user);
      return response.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('campuspulse_token');
    localStorage.removeItem('campuspulse_user');
    setToken(null);
    setUser(null);
  };

  const switchRolePreview = (newRole: Role) => {
    const mockUser = mockUsers[newRole] || mockUsers.student;
    setUser(mockUser);
    localStorage.setItem('campuspulse_user', JSON.stringify(mockUser));
    localStorage.setItem('campuspulse_token', `mock_token_${newRole}`);
    setToken(`mock_token_${newRole}`);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        switchRolePreview,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
