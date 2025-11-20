
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
  id: string;
  username: string;
  email: string; // Used for mock Google login
}

export interface Service {
  id: string;
  userId: string;
  title: string;
  description: string;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string
  responsible: string;
  status: ServiceStatus;
  currentProcess: ProcessStep;
  result?: string;
  comments?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationState {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}
