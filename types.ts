

export enum ServiceStatus {
  PENDING = 'Pendente',
  IN_PROGRESS = 'Em andamento',
  COMPLETED = 'Concluído',
  CANCELED = 'Cancelado',
}

export enum ProcessStep {
  ANALYSIS = 'Em análise',
  EXECUTION = 'Em execução',
  REVIEW = 'Em revisão',
  DELIVERED = 'Entregue',
}

export interface User {
  uid: string; // Firebase User ID
  email: string | null;
  displayName?: string | null; // Corresponds to username
  photoURL?: string | null; // Profile picture URL
}

// New: Interface for Service
export interface Service {
  id: string; // Document ID from Firestore
  userId: string; // Firebase User ID
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  responsible: string;
  status: ServiceStatus;
  currentProcess: ProcessStep;
  result?: string;
  comments?: string;
  createdAt: string;
  updatedAt: string;
  images?: string[]; // Optional array of base64 image strings
}

export interface NotificationState {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}