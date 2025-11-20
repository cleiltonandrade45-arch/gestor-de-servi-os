
import React from 'react';
import { Service, ServiceStatus } from '../types';
import { SERVICE_STATUS_COLORS } from '../constants';
import Button from './Button';

interface ServiceCardProps {
  service: Service;
  onSelect: (serviceId: string) => void;
  onEdit: (service: Service) => void;
  onDelete: (serviceId: string) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onSelect, onEdit, onDelete }) => {
  const statusColorClass = SERVICE_STATUS_COLORS[service.status as ServiceStatus] || 'bg-gray-200 text-gray-800';

  return (
    <div
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-4 border border-gray-200 flex flex-col justify-between"
    >
      <div className="flex-1" onClick={() => onSelect(service.id)}>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-gray-900 line-clamp-1">{service.title}</h3>
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColorClass}`}
          >
            {service.status}
          </span>
        </div>
        <p className="text-gray-600 mb-3 line-clamp-2">{service.description}</p>
        <div className="text-sm text-gray-500 space-y-1">
          <p><strong>Responsável:</strong> {service.responsible}</p>
          <p><strong>Processo:</strong> {service.currentProcess}</p>
          <p><strong>Início:</strong> {new Date(service.startDate).toLocaleDateString()}</p>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
        <Button
          variant="secondary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(service);
          }}
          title="Editar Serviço"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
          </svg>
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(service.id);
          }}
          title="Excluir Serviço"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
        </Button>
      </div>
    </div>
  );
};

export default ServiceCard;
