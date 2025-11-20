
import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { User } from '../types';
import { LOCAL_STORAGE_KEYS, MOCK_GOOGLE_USER } from '../constants';
import {
  loadAuthUser,
  saveAuthUser,
  removeAuthUser,
  loadMockUsers,
  saveMockUsers,
} from '../services/localStorageService';
import { useNotifications } from './NotificationContext';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string, email: string) => Promise<boolean>;
  googleLogin: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { addNotification } = useNotifications();

  // Using a ref to hold mockUsers to avoid re-creating it on every render in useCallback deps
  const mockUsersRef = useRef<Record<string, { password: string; email: string; user: User }>>({});

  useEffect(() => {
    const storedUsers = loadMockUsers();
    if (storedUsers) {
      mockUsersRef.current = storedUsers;
    }

    const user = loadAuthUser();
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const userEntry = mockUsersRef.current[username];
    if (userEntry && userEntry.password === password) {
      setCurrentUser(userEntry.user);
      setIsAuthenticated(true);
      saveAuthUser(userEntry.user);
      setIsLoading(false);
      return true;
    }
    setIsLoading(false);
    return false;
  }, []); // mockUsersRef.current is not a direct dependency for useCallback as its content is mutable

  const register = useCallback(async (username: string, password: string, email: string) => {
    setIsLoading(true);
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (mockUsersRef.current[username]) {
      setIsLoading(false);
      return false; // User already exists
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      username,
      email,
    };

    mockUsersRef.current = {
      ...mockUsersRef.current,
      [username]: { password, email, user: newUser },
    };
    saveMockUsers(mockUsersRef.current);
    setIsLoading(false);
    return true;
  }, []);

  const googleLogin = useCallback(async () => {
    setIsLoading(true);
    // Simulate Google OAuth flow
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setCurrentUser(MOCK_GOOGLE_USER);
    setIsAuthenticated(true);
    saveAuthUser(MOCK_GOOGLE_USER);

    // Ensure mock_users contains google user for consistency, though not used for password login
    if (!mockUsersRef.current[MOCK_GOOGLE_USER.username]) {
      mockUsersRef.current = {
        ...mockUsersRef.current,
        [MOCK_GOOGLE_USER.username]: { password: '', email: MOCK_GOOGLE_USER.email, user: MOCK_GOOGLE_USER },
      };
      saveMockUsers(mockUsersRef.current);
    }

    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    removeAuthUser();
    addNotification('Você foi desconectado(a).', 'info');
  }, [addNotification]);

  const value = React.useMemo(() => ({
    currentUser,
    isAuthenticated,
    isLoading,
    login,
    register,
    googleLogin,
    logout,
  }), [currentUser, isAuthenticated, isLoading, login, register, googleLogin, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
