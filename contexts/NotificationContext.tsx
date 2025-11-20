
import React, { createContext, useState, useContext, useCallback, useRef } from 'react';
import { NotificationState } from '../types';

interface NotificationContextType {
  notifications: NotificationState[];
  addNotification: (message: string, type?: 'success' | 'error' | 'info' | 'warning', duration?: number) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationState[]>([]);
  const nextId = useRef(0);

  const addNotification = useCallback(
    (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration: number = 3000) => {
      const id = String(nextId.current++);
      const newNotification: NotificationState = { id, message, type, duration };
      setNotifications((prev) => [...prev, newNotification]);

      if (duration > 0) {
        setTimeout(() => {
          setNotifications((prev) => prev.filter((notif) => notif.id !== id));
        }, duration);
      }
    },
    [],
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  const value = React.useMemo(() => ({
    notifications,
    addNotification,
    removeNotification,
  }), [notifications, addNotification, removeNotification]);

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
