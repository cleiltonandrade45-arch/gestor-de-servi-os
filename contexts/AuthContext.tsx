import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { User } from '../types';
import { LOCAL_STORAGE_KEYS } from '../constants';
import { saveAuthUser, loadAuthUser, removeAuthUser } from '../services/localStorageService';
import { useNotifications } from './NotificationContext';
import { auth, db } from '../firebaseConfig'; // Import Firebase Auth and Firestore
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>; // New: Google Sign-in
  updateProfilePicture: (imageUrl: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

// Helper to generate initials avatar URL (same as in Header for consistency)
const generateInitialsAvatar = (username: string) => {
  const initials = username.split(' ').map(n => n[0]).join('').toUpperCase();
  return `https://api.dicebear.com/7.x/initials/svg?seed=${initials}&chars=2`;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { addNotification } = useNotifications();

  // Fetches additional user data from Firestore
  const fetchFirestoreUserData = useCallback(async (firebaseUser: FirebaseUser): Promise<User> => {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: data.displayName || firebaseUser.displayName,
        photoURL: data.photoURL || firebaseUser.photoURL,
      };
    } else {
      // If no custom doc, create a basic one
      const newUserDoc: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário',
        photoURL: firebaseUser.photoURL || generateInitialsAvatar(firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário'),
      };
      await setDoc(userDocRef, newUserDoc);
      return newUserDoc;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        try {
          const userWithFirestoreData = await fetchFirestoreUserData(firebaseUser);
          setCurrentUser(userWithFirestoreData);
          setIsAuthenticated(true);
          saveAuthUser(userWithFirestoreData); // Save to local storage
        } catch (error) {
          console.error("Error fetching Firestore user data:", error);
          setCurrentUser(null);
          setIsAuthenticated(false);
          removeAuthUser();
          addNotification('Erro ao carregar dados do usuário.', 'error');
        }
      } else {
        // User is signed out
        setCurrentUser(null);
        setIsAuthenticated(false);
        removeAuthUser(); // Remove from local storage
      }
      setIsLoading(false);
    });

    // Attempt to load from local storage immediately to prevent flicker
    const localUser = loadAuthUser();
    if (localUser) {
      setCurrentUser(localUser);
      setIsAuthenticated(true);
    }

    return () => unsubscribe(); // Cleanup subscription
  }, [fetchFirestoreUserData, addNotification]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged will handle setting currentUser and isAuthenticated
    setIsLoading(false);
  }, []);

  const register = useCallback(async (email: string, password: string, displayName: string) => {
    setIsLoading(true);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Update display name and photo URL in Firebase Auth profile
    const defaultPhotoURL = generateInitialsAvatar(displayName);
    await updateProfile(firebaseUser, {
      displayName: displayName,
      photoURL: defaultPhotoURL,
    });

    // Create a user document in Firestore
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const newUser: User = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: displayName,
      photoURL: defaultPhotoURL,
    };
    await setDoc(userDocRef, newUser);
    // onAuthStateChanged will handle setting currentUser and isAuthenticated
    setIsLoading(false);
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    await signOut(auth);
    // onAuthStateChanged will handle clearing currentUser and isAuthenticated
    addNotification('Você foi desconectado(a).', 'info');
    setIsLoading(false);
  }, [addNotification]);

  const signInWithGoogle = useCallback(async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    // onAuthStateChanged will handle setting currentUser and isAuthenticated
    addNotification('Login com Google bem-sucedido!', 'success');
    setIsLoading(false);
  }, [addNotification]);

  const updateProfilePicture = useCallback(async (imageUrl: string) => {
    if (auth.currentUser) {
      // Update Firebase Auth profile photoURL
      await updateProfile(auth.currentUser, {
        photoURL: imageUrl,
      });

      // Also update in Firestore user document
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userDocRef, { photoURL: imageUrl }, { merge: true });

      // Update local state
      setCurrentUser((prevUser) => prevUser ? { ...prevUser, photoURL: imageUrl } : null);
      addNotification('Foto de perfil atualizada com sucesso!', 'success');
    } else {
      addNotification('Erro: Nenhum usuário logado para atualizar a foto de perfil.', 'error');
      throw new Error('No user logged in to update profile picture.');
    }
  }, [addNotification]);

  const value = React.useMemo(() => ({
    currentUser,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    signInWithGoogle,
    updateProfilePicture,
  }), [currentUser, isAuthenticated, isLoading, login, register, logout, signInWithGoogle, updateProfilePicture]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};