
import { User } from '../types';
import { LOCAL_STORAGE_KEYS } from '../constants';

// --- Auth User Management ---
export function saveAuthUser(user: User) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving auth user to localStorage:', error);
  }
}

export function loadAuthUser(): User | null {
  try {
    const userString = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_USER);
    return userString ? JSON.parse(userString) : null;
  } catch (error) {
    console.error('Error loading auth user from localStorage:', error);
    return null;
  }
}

export function removeAuthUser() {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_USER);
  } catch (error) {
    console.error('Error removing auth user from localStorage:', error);
  }
}

// --- Mock User Credentials Management ---
interface MockUserEntry {
  password: string;
  email: string;
  user: User;
}

export function saveMockUsers(mockUsers: Record<string, MockUserEntry>) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEYS.MOCK_USERS, JSON.stringify(mockUsers));
  } catch (error) {
    console.error('Error saving mock users to localStorage:', error);
  }
}

export function loadMockUsers(): Record<string, MockUserEntry> {
  try {
    const usersString = localStorage.getItem(LOCAL_STORAGE_KEYS.MOCK_USERS);
    return usersString ? JSON.parse(usersString) : {};
  } catch (error) {
    console.error('Error loading mock users from localStorage:', error);
    return {};
  }
}
