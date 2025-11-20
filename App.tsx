
import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ServiceProvider } from './contexts/ServiceContext';
import { NotificationProvider } from './contexts/NotificationContext';
import AuthForm from './components/AuthForm';
import Header from './components/Header';
import ServiceList from './components/ServiceList';
import ServiceDetail from './components/ServiceDetail';
import ServiceForm from './components/ServiceForm';
import Notification from './components/Notification';
import Modal from './components/Modal';
import ProfilePictureUploader from './components/ProfilePictureUploader'; // New: Profile Picture Uploader
import { Service } from './types';

// Main App component
function AppContent() {
  const { isAuthenticated, currentUser, isLoading } = useAuth();
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [isServiceFormOpen, setIsServiceFormOpen] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isProfilePicModalOpen, setIsProfilePicModalOpen] = useState<boolean>(false); // New: State for profile picture modal

  const handleSelectService = useCallback((serviceId: string) => {
    setSelectedServiceId(serviceId);
  }, []);

  const handleCloseServiceDetail = useCallback(() => {
    setSelectedServiceId(null);
  }, []);

  const handleOpenAddService = useCallback(() => {
    setEditingService(null);
    setIsServiceFormOpen(true);
  }, []);

  const handleEditService = useCallback((service: Service) => {
    setEditingService(service);
    setIsServiceFormOpen(true);
  }, []);

  const handleCloseServiceForm = useCallback(() => {
    setIsServiceFormOpen(false);
    setEditingService(null);
  }, []);

  // New: Functions for profile picture modal
  const handleOpenProfilePicModal = useCallback(() => {
    setIsProfilePicModalOpen(true);
  }, []);

  const handleCloseProfilePicModal = useCallback(() => {
    setIsProfilePicModalOpen(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
        <p className="ml-4 text-lg text-gray-700">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Notification />
      {isAuthenticated && currentUser ? (
        <>
          <Header onAddService={handleOpenAddService} onOpenProfilePicModal={handleOpenProfilePicModal} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Meus Serviços</h1>
            <ServiceList
              onSelectService={handleSelectService}
              onEditService={handleEditService}
            />

            {selectedServiceId && (
              <Modal isOpen={!!selectedServiceId} onClose={handleCloseServiceDetail} title="Detalhes do Serviço">
                <ServiceDetail serviceId={selectedServiceId} />
              </Modal>
            )}

            <Modal isOpen={isServiceFormOpen} onClose={handleCloseServiceForm} title={editingService ? 'Editar Serviço' : 'Adicionar Novo Serviço'}>
              <ServiceForm serviceToEdit={editingService} onClose={handleCloseServiceForm} />
            </Modal>

            {/* New: Profile Picture Uploader Modal */}
            <Modal isOpen={isProfilePicModalOpen} onClose={handleCloseProfilePicModal} title="Mudar Foto de Perfil">
              <ProfilePictureUploader onClose={handleCloseProfilePicModal} />
            </Modal>
          </main>
        </>
      ) : (
        <AuthForm />
      )}
    </div>
  );
}

function App() {
  return (
    <NotificationProvider> {/* NotificationProvider agora envolve AuthProvider */}
      <AuthProvider>
        <ServiceProvider>
          <AppContent />
        </ServiceProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;