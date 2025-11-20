
import React, { useState, useMemo, useCallback } from 'react';
import { useServices } from '../contexts/ServiceContext';
import { Service, ServiceStatus, ProcessStep } from '../types';
import ServiceCard from './ServiceCard';
import Modal from './Modal';
import Button from './Button';
import { useNotifications } from '../contexts/NotificationContext';

interface ServiceListProps {
  onSelectService: (serviceId: string) => void;
  onEditService: (service: Service) => void;
}

const ServiceList: React.FC<ServiceListProps> = ({ onSelectService, onEditService }) => {
  const { services, deleteService } = useServices();
  const { addNotification } = useNotifications();
  const [filterStatus, setFilterStatus] = useState<ServiceStatus | 'all'>('all');
  const [filterProcess, setFilterProcess] = useState<ProcessStep | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortKey, setSortKey] = useState<keyof Service>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [serviceToDeleteId, setServiceToDeleteId] = useState<string | null>(null);

  const filteredAndSortedServices = useMemo(() => {
    let filtered = services;

    if (filterStatus !== 'all') {
      filtered = filtered.filter((service) => service.status === filterStatus);
    }

    if (filterProcess !== 'all') {
      filtered = filtered.filter((service) => service.currentProcess === filterProcess);
    }

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (service) =>
          service.title.toLowerCase().includes(lowerCaseSearchTerm) ||
          service.description.toLowerCase().includes(lowerCaseSearchTerm) ||
          service.responsible.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    // Sort
    return [...filtered].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue === undefined || bValue === undefined) return 0;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      // Fallback for other types, e.g., dates
      if (sortKey === 'createdAt' || sortKey === 'updatedAt' || sortKey === 'startDate' || sortKey === 'endDate') {
        const dateA = new Date(aValue as string).getTime();
        const dateB = new Date(bValue as string).getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }
      return 0;
    });
  }, [services, filterStatus, filterProcess, searchTerm, sortKey, sortDirection]);

  const handleDeleteClick = useCallback((serviceId: string) => {
    setServiceToDeleteId(serviceId);
    setIsDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (serviceToDeleteId) {
      deleteService(serviceToDeleteId);
      setIsDeleteModalOpen(false);
      setServiceToDeleteId(null);
      addNotification('Serviço excluído com sucesso!', 'success');
    }
  }, [serviceToDeleteId, deleteService, addNotification]);

  const handleSort = useCallback((key: keyof Service) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  }, [sortKey, sortDirection]);

  const getSortIcon = useCallback((key: keyof Service) => {
    if (sortKey === key) {
      return sortDirection === 'asc' ? '▲' : '▼';
    }
    return '';
  }, [sortKey, sortDirection]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-8">
      <div className="flex flex-col sm:flex-row gap-4 mb-6 sticky top-20 bg-white py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 z-10 border-b border-gray-200">
        <input
          type="text"
          placeholder="Buscar serviço..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as ServiceStatus | 'all')}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">Todos os Status</option>
          {Object.values(ServiceStatus).map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <select
          value={filterProcess}
          onChange={(e) => setFilterProcess(e.target.value as ProcessStep | 'all')}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">Todos os Processos</option>
          {Object.values(ProcessStep).map((process) => (
            <option key={process} value={process}>
              {process}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4 text-sm text-gray-600 flex flex-wrap gap-2 items-center">
        <span>Ordenar por:</span>
        <Button variant="secondary" size="sm" onClick={() => handleSort('title')} className="flex items-center gap-1">
          Título {getSortIcon('title')}
        </Button>
        <Button variant="secondary" size="sm" onClick={() => handleSort('status')} className="flex items-center gap-1">
          Status {getSortIcon('status')}
        </Button>
        <Button variant="secondary" size="sm" onClick={() => handleSort('startDate')} className="flex items-center gap-1">
          Data de Início {getSortIcon('startDate')}
        </Button>
        <Button variant="secondary" size="sm" onClick={() => handleSort('createdAt')} className="flex items-center gap-1">
          Criado em {getSortIcon('createdAt')}
        </Button>
      </div>

      {filteredAndSortedServices.length === 0 ? (
        <p className="text-center text-gray-500 mt-10 text-lg">Nenhum serviço encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onSelect={onSelectService}
              onEdit={onEditService}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirmar Exclusão">
        <p className="text-gray-700 mb-6">Tem certeza de que deseja excluir este serviço? Esta ação não pode ser desfeita.</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Excluir
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ServiceList;
