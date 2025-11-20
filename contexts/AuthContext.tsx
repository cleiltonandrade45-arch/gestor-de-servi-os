import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { User } from '../types';
import { LOCAL_STORAGE_KEYS } from '../constants';
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
  logout: () => void;
  updateProfilePicture: (imageUrl: string) => void; // New: Function to update profile picture
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

// Helper to generate initials avatar URL
const generateInitialsAvatar = (username: string) => {
  const initials = username.split(' ').map(n => n[0]).join('').toUpperCase();
  return `https://api.dicebear.com/7.x/initials/svg?seed=${initials}&chars=2`;
};

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
  }, []);

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
      profilePictureUrl: generateInitialsAvatar(username), // New: Default avatar
    };

    mockUsersRef.current = {
      ...mockUsersRef.current,
      [username]: { password, email, user: newUser },
    };
    saveMockUsers(mockUsersRef.current);
    setIsLoading(false);
    return true;
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    removeAuthUser();
    addNotification('Você foi desconectado(a).', 'info');
  }, [addNotification]);

  const updateProfilePicture = useCallback((imageUrl: string) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, profilePictureUrl: imageUrl };
      setCurrentUser(updatedUser);
      saveAuthUser(updatedUser);

      // Also update in mockUsersRef for persistence across sessions/logins
      if (mockUsersRef.current[currentUser.username]) {
        mockUsersRef.current = {
          ...mockUsersRef.current,
          [currentUser.username]: {
            ...mockUsersRef.current[currentUser.username],
            user: updatedUser,
          },
        };
        saveMockUsers(mockUsersRef.current);
      }
      addNotification('Foto de perfil atualizada com sucesso!', 'success');
    } else {
      addNotification('Erro: Nenhum usuário logado para atualizar a foto de perfil.', 'error');
    }
  }, [currentUser, addNotification]);

  const value = React.useMemo(() => ({
    currentUser,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfilePicture,
  }), [currentUser, isAuthenticated, isLoading, login, register, logout, updateProfilePicture]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};