import { ServiceStatus, ProcessStep, User } from './types';

export const SERVICE_STATUS_COLORS: Record<ServiceStatus, string> = {
  [ServiceStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [ServiceStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
  [ServiceStatus.COMPLETED]: 'bg-green-100 text-green-800',
  [ServiceStatus.CANCELED]: 'bg-red-100 text-red-800',
};

export const PROCESS_STEP_COLORS: Record<ProcessStep, string> = {
  [ProcessStep.ANALYSIS]: 'bg-purple-100 text-purple-800',
  [ProcessStep.EXECUTION]: 'bg-indigo-100 text-indigo-800',
  [ProcessStep.REVIEW]: 'bg-orange-100 text-orange-800',
  [ProcessStep.DELIVERED]: 'bg-teal-100 text-teal-800',
};

export const LOCAL_STORAGE_KEYS = {
  AUTH_USER: 'auth_user', // Still used for local persistence of Firebase auth user object
  SERVICES_PREFIX: 'user_services_', // Still used as a fallback/prefix for local service data, although now Firestore is primary
};