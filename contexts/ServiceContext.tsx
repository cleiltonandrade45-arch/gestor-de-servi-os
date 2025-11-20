
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { Service } from '../types';
import { useAuth } from './AuthContext';
import { loadServicesForUser, saveServicesForUser } from '../services/serviceDataService';
import { useNotifications } from './NotificationContext';

interface ServiceContextType {
  services: Service[];
  addService: (service: Service) => void;
  updateService: (updatedService: Service) => void;
  deleteService: (serviceId: string) => void;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

interface ServiceProviderProps {
  children: React.ReactNode;
}

export const ServiceProvider: React.FC<ServiceProviderProps> = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const { addNotification } = useNotifications();

  // Load services when user changes or authenticates
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const userServices = loadServicesForUser(currentUser.id);
      setServices(userServices);
    } else {
      setServices([]); // Clear services if no user or not authenticated
    }
  }, [isAuthenticated, currentUser]);

  // Save services whenever they change
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      saveServicesForUser(currentUser.id, services);
    }
  }, [services, isAuthenticated, currentUser]);

  const addService = useCallback((service: Service) => {
    setServices((prevServices) => [...prevServices, service]);
  }, []);

  const updateService = useCallback((updatedService: Service) => {
    setServices((prevServices) =>
      prevServices.map((service) =>
        service.id === updatedService.id ? updatedService : service
      )
    );
  }, []);

  const deleteService = useCallback((serviceId: string) => {
    setServices((prevServices) => prevServices.filter((service) => service.id !== serviceId));
  }, []);

  const value = React.useMemo(() => ({
    services,
    addService,
    updateService,
    deleteService,
  }), [services, addService, updateService, deleteService]);

  return <ServiceContext.Provider value={value}>{children}</ServiceContext.Provider>;
};

export const useServices = () => {
  const context = useContext(ServiceContext);
  if (context === undefined) {
    throw new Error('useServices must be used within a ServiceProvider');
  }
  return context;
};
