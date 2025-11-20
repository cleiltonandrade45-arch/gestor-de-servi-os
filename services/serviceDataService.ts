
import { Service } from '../types';
import { LOCAL_STORAGE_KEYS } from '../constants';

function getServiceLocalStorageKey(userId: string): string {
  return `${LOCAL_STORAGE_KEYS.SERVICES_PREFIX}${userId}`;
}

export function loadServicesForUser(userId: string): Service[] {
  try {
    const key = getServiceLocalStorageKey(userId);
    const servicesString = localStorage.getItem(key);
    return servicesString ? JSON.parse(servicesString) : [];
  } catch (error) {
    console.error(`Error loading services for user ${userId} from localStorage:`, error);
    return [];
  }
}

export function saveServicesForUser(userId: string, services: Service[]): void {
  try {
    const key = getServiceLocalStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(services));
  } catch (error) {
    console.error(`Error saving services for user ${userId} to localStorage:`, error);
  }
}
