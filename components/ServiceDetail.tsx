
import React, { useCallback, useState } from 'react';
import { useServices } from '../contexts/ServiceContext';
import { ServiceStatus, ProcessStep, Service } from '../types';
import { SERVICE_STATUS_COLORS, PROCESS_STEP_COLORS } from '../constants';
import Button from './Button';
import { useNotifications } from '../contexts/NotificationContext';

interface ServiceDetailProps {
  serviceId: string;
}

const ServiceDetail: React.FC<ServiceDetailProps> = ({ serviceId }) => {
  const { services, updateService } = useServices();
  const service = services.find((s) => s.id === serviceId);
  const { addNotification } = useNotifications();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedStatus, setEditedStatus] = useState<ServiceStatus>(service?.status || ServiceStatus.PENDING);
  const [editedProcess, setEditedProcess] = useState<ProcessStep>(service?.currentProcess || ProcessStep.ANALYSIS);
  const [editedComments, setEditedComments] = useState<string>(service?.comments || '');
  const [editedResult, setEditedResult] = useState<string>(service?.result || '');
  const [editedEndDate, setEditedEndDate] = useState<string>(service?.endDate ? service.endDate.split('T')[0] : '');


  React.useEffect(() => {
    if (service) {
      setEditedStatus(service.status);
      setEditedProcess(service.currentProcess);
      setEditedComments(service.comments || '');
      setEditedResult(service.result || '');
      setEditedEndDate(service.endDate ? service.endDate.split('T')[0] : '');
    }
  }, [service]);

  const handlePrint = useCallback(() => {
    if (service) {
      const textContent = `
        Detalhes do Serviço: ${service.title}
        ------------------------------------------
        Descrição: ${service.description}
        Data de Início: ${new Date(service.startDate).toLocaleDateString()}
        Data de Término: ${service.endDate ? new Date(service.endDate).toLocaleDateString() : 'N/A'}
        Responsável: ${service.responsible}
        Status: ${service.status}
        Processo Atual: ${service.currentProcess}
        Resultado: ${service.result || 'N/A'}
        Comentários: ${service.comments || 'N/A'}
        Criado em: ${new Date(service.createdAt).toLocaleString()}
        Atualizado em: ${new Date(service.updatedAt).toLocaleString()}
        ${service.images && service.images.length > 0 ? `\nImagens: ${service.images.length} anexadas` : ''}
      `;

      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `servico_${service.title.replace(/\s/g, '_')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addNotification('Detalhes do serviço exportados para TXT.', 'success');
    }
  }, [service, addNotification]);

  const handleSave = useCallback(() => {
    if (service) {
      const updatedService: Service = {
        ...service,
        status: editedStatus,
        currentProcess: editedProcess,
        comments: editedComments,
        result: editedResult,
        endDate: editedEndDate ? new Date(editedEndDate).toISOString() : undefined,
        updatedAt: new Date().toISOString(),
      };
      updateService(updatedService);
      setIsEditing(false);
      addNotification('Status e notas do serviço atualizados com sucesso!', 'success');
    }
  }, [service, editedStatus, editedProcess, editedComments, editedResult, editedEndDate, updateService, addNotification]);

  if (!service) {
    return <div className="text-gray-700">Serviço não encontrado.</div>;
  }

  const statusClass = SERVICE_STATUS_COLORS[service.status as ServiceStatus] || 'bg-gray-200 text-gray-800';
  const processClass = PROCESS_STEP_COLORS[service.currentProcess as ProcessStep] || 'bg-gray-200 text-gray-800';

  return (
    <div className="bg-white p-6 rounded-lg shadow-inner overflow-y-auto max-h-[70vh]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 pb-4 border-b border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 sm:mb-0">{service.title}</h2>
        <div className="flex gap-3">
          <Button variant="info" size="sm" onClick={handlePrint}>
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m0 0v1a2 2 0 002 2h6a2 2 0 002-2v-1M6 10H4a2 2 0 00-2 2v5a2 2 0 002 2h16a2 2 0 002-2v-5a2 2 0 00-2-2h-2"></path>
            </svg>
            Imprimir (.txt)
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsEditing(!isEditing)}>
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            {isEditing ? 'Cancelar Edição' : 'Atualizar Status'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
        <div>
          <p className="text-lg font-semibold text-gray-800 mb-2">Descrição:</p>
          <p className="whitespace-pre-wrap">{service.description}</p>
        </div>

        <div>
          <p className="text-lg font-semibold text-gray-800 mb-2">Datas:</p>
          <p><strong>Início:</strong> {new Date(service.startDate).toLocaleDateString()}</p>
          {isEditing ? (
            <div>
                <label htmlFor="editedEndDate" className="block text-sm font-medium text-gray-700 mt-2">
                  <strong>Término:</strong>
                </label>
                <input
                    type="date"
                    id="editedEndDate"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900"
                    value={editedEndDate}
                    onChange={(e) => setEditedEndDate(e.target.value)}
                />
            </div>
        ) : (
            <p><strong>Término:</strong> {service.endDate ? new Date(service.endDate).toLocaleDateString() : 'N/A'}</p>
        )}
          <p className="mt-4"><strong>Responsável:</strong> {service.responsible}</p>
        </div>

        <div>
          <p className="text-lg font-semibold text-gray-800 mb-2">Status:</p>
          {isEditing ? (
            <select
              value={editedStatus}
              onChange={(e) => {
                const newStatus = e.target.value as ServiceStatus;
                setEditedStatus(newStatus);
                if (newStatus === ServiceStatus.COMPLETED) {
                  setEditedEndDate(new Date().toISOString().split('T')[0]);
                } else {
                  setEditedEndDate('');
                }
              }}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white text-gray-900"
            >
              {Object.values(ServiceStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          ) : (
            <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${statusClass}`}>
              {service.status}
            </span>
          )}
        </div>

        <div>
          <p className="text-lg font-semibold text-gray-800 mb-2">Processo Atual:</p>
          {isEditing ? (
            <select
              value={editedProcess}
              onChange={(e) => setEditedProcess(e.target.value as ProcessStep)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white text-gray-900"
            >
              {Object.values(ProcessStep).map((step) => (
                <option key={step} value={step}>
                  {step}
                </option>
              ))}
            </select>
          ) : (
            <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${processClass}`}>
              {service.currentProcess}
            </span>
          )}
        </div>

        <div className="md:col-span-2">
          <p className="text-lg font-semibold text-gray-800 mb-2">Comentários:</p>
          {isEditing ? (
            <textarea
              value={editedComments}
              onChange={(e) => setEditedComments(e.target.value)}
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900"
              placeholder="Adicione comentários ou notas..."
            ></textarea>
          ) : (
            <p className="whitespace-pre-wrap">{service.comments || 'N/A'}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <p className="text-lg font-semibold text-gray-800 mb-2">Resultado:</p>
          {isEditing ? (
            <textarea
              value={editedResult}
              onChange={(e) => setEditedResult(e.target.value)}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900"
              placeholder="Descreva o resultado final do serviço..."
            ></textarea>
          ) : (
            <p className="whitespace-pre-wrap">{service.result || 'N/A'}</p>
          )}
        </div>
      </div>

      {service.images && service.images.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-lg font-semibold text-gray-800 mb-2">Fotos Anexadas:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {service.images.map((image, index) => (
              <div key={index} className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                <img
                  src={image}
                  alt={`Foto do serviço ${service.title} - ${index + 1}`}
                  className="w-full h-32 object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {isEditing && (
        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
          <Button variant="success" onClick={handleSave}>
            Salvar Alterações
          </Button>
        </div>
      )}
    </div>
  );
};

export default ServiceDetail;