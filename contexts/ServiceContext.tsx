import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { Service } from '../types';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { db } from '../firebaseConfig'; // Import Firestore
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';

interface ServiceContextType {
  services: Service[];
  addService: (service: Omit<Service, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<void>;
  updateService: (updatedService: Service) => Promise<void>;
  deleteService: (serviceId: string) => Promise<void>;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

interface ServiceProviderProps {
  children: React.ReactNode;
}

export const ServiceProvider: React.FC<ServiceProviderProps> = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const { addNotification } = useNotifications();

  // Listen for real-time service updates from Firestore
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const servicesCollectionRef = collection(db, 'services');
      const q = query(
        servicesCollectionRef,
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const servicesData: Service[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            userId: data.userId,
            title: data.title,
            description: data.description,
            startDate: data.startDate,
            endDate: data.endDate,
            responsible: data.responsible,
            status: data.status,
            currentProcess: data.currentProcess,
            result: data.result,
            comments: data.comments,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
            images: data.images || [],
          };
        });
        setServices(servicesData);
      }, (error) => {
        console.error("Error fetching services:", error);
        addNotification('Erro ao carregar serviços.', 'error');
      });

      return () => unsubscribe(); // Cleanup listener on unmount or user change
    } else {
      setServices([]); // Clear services if no user or not authenticated
    }
  }, [isAuthenticated, currentUser, addNotification]);

  const addService = useCallback(async (serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!currentUser) {
      addNotification('Usuário não autenticado.', 'error');
      return;
    }
    try {
      await addDoc(collection(db, 'services'), {
        ...serviceData,
        userId: currentUser.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      addNotification('Serviço adicionado com sucesso!', 'success');
    } catch (error) {
      console.error("Error adding service:", error);
      addNotification('Erro ao adicionar serviço.', 'error');
    }
  }, [currentUser, addNotification]);

  const updateService = useCallback(async (updatedService: Service) => {
    if (!currentUser || updatedService.userId !== currentUser.uid) {
      addNotification('Você não tem permissão para editar este serviço.', 'error');
      return;
    }
    try {
      const serviceDocRef = doc(db, 'services', updatedService.id);
      await updateDoc(serviceDocRef, {
        ...updatedService,
        updatedAt: Timestamp.now(),
      });
      addNotification('Serviço atualizado com sucesso!', 'success');
    } catch (error) {
      console.error("Error updating service:", error);
      addNotification('Erro ao atualizar serviço.', 'error');
    }
  }, [currentUser, addNotification]);

  const deleteService = useCallback(async (serviceId: string) => {
    // Optimistic UI update or check permissions before deleting
    const serviceToDelete = services.find(s => s.id === serviceId);
    if (!currentUser || serviceToDelete?.userId !== currentUser.uid) {
      addNotification('Você não tem permissão para excluir este serviço.', 'error');
      return;
    }
    try {
      const serviceDocRef = doc(db, 'services', serviceId);
      await deleteDoc(serviceDocRef);
      addNotification('Serviço excluído com sucesso!', 'success');
    } catch (error) {
      console.error("Error deleting service:", error);
      addNotification('Erro ao excluir serviço.', 'error');
    }
  }, [currentUser, services, addNotification]);

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