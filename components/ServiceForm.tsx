import React, { useState, useEffect, useCallback } from 'react';
import { useServices } from '../contexts/ServiceContext';
import { useAuth } from '../contexts/AuthContext';
import { Service, ServiceStatus, ProcessStep } from '../types';
import Button from './Button';
import { useNotifications } from '../contexts/NotificationContext';

interface ServiceFormProps {
  serviceToEdit?: Service | null;
  onClose: () => void;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ serviceToEdit, onClose }) => {
  const { addService, updateService } = useServices();
  const { currentUser } = useAuth();
  const { addNotification } = useNotifications();

  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>('');
  const [responsible, setResponsible] = useState<string>('');
  const [status, setStatus] = useState<ServiceStatus>(ServiceStatus.PENDING);
  const [currentProcess, setCurrentProcess] = useState<ProcessStep>(ProcessStep.ANALYSIS);
  const [result, setResult] = useState<string>('');
  const [comments, setComments] = useState<string>('');
  const [images, setImages] = useState<string[]>([]); // New state for images

  useEffect(() => {
    if (serviceToEdit) {
      setTitle(serviceToEdit.title);
      setDescription(serviceToEdit.description);
      setStartDate(serviceToEdit.startDate.split('T')[0]);
      setEndDate(serviceToEdit.endDate ? serviceToEdit.endDate.split('T')[0] : '');
      setResponsible(serviceToEdit.responsible);
      setStatus(serviceToEdit.status);
      setCurrentProcess(serviceToEdit.currentProcess);
      setResult(serviceToEdit.result || '');
      setComments(serviceToEdit.comments || '');
      setImages(serviceToEdit.images || []); // Initialize images for editing
    } else {
      // Reset form for new service
      setTitle('');
      setDescription('');
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate('');
      setResponsible('');
      setStatus(ServiceStatus.PENDING);
      setCurrentProcess(ProcessStep.ANALYSIS);
      setResult('');
      setComments('');
      setImages([]); // Clear images for new service
    }
  }, [serviceToEdit]);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setImages((prevImages) => [...prevImages, reader.result as string]);
          };
          reader.readAsDataURL(file);
        } else {
          addNotification(`O arquivo ${file.name} não é uma imagem válida e foi ignorado.`, 'warning');
        }
      });
    }
  }, [addNotification]);

  const handleRemoveImage = useCallback((indexToRemove: number) => {
    setImages((prevImages) => prevImages.filter((_, index) => index !== indexToRemove));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      addNotification('Usuário não autenticado.', 'error');
      return;
    }

    try {
      if (serviceToEdit) {
        // For update, we send the full service object with its ID
        const updatedService: Service = {
          ...serviceToEdit,
          title,
          description,
          startDate: new Date(startDate).toISOString(),
          endDate: endDate ? new Date(endDate).toISOString() : undefined,
          responsible,
          status,
          currentProcess,
          result,
          comments,
          images, // Include images in service data
        };
        await updateService(updatedService);
      } else {
        // For add, we omit id, createdAt, updatedAt, userId as they are handled by context/Firestore
        const newServiceData = {
          title,
          description,
          startDate: new Date(startDate).toISOString(),
          endDate: endDate ? new Date(endDate).toISOString() : undefined,
          responsible,
          status,
          currentProcess,
          result,
          comments,
          images, // Include images in service data
        };
        await addService(newServiceData);
      }
      onClose();
    } catch (error: any) {
      addNotification(`Erro ao salvar serviço: ${error.message}`, 'error');
      console.error('Error saving service:', error);
    }
  }, [
    title,
    description,
    startDate,
    endDate,
    responsible,
    status,
    currentProcess,
    result,
    comments,
    images, // Add images to dependencies
    currentUser,
    serviceToEdit,
    addService,
    updateService,
    onClose,
    addNotification,
  ]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Título do Serviço
        </label>
        <input
          type="text"
          id="title"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Descrição
        </label>
        <textarea
          id="description"
          rows={3}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        ></textarea>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            Data de Início
          </label>
          <input
            type="date"
            id="startDate"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
            Data de Término (Opcional)
          </label>
          <input
            type="date"
            id="endDate"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label htmlFor="responsible" className="block text-sm font-medium text-gray-700">
          Responsável
        </label>
        <input
          type="text"
          id="responsible"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={responsible}
          onChange={(e) => setResponsible(e.target.value)}
          required
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={status}
            onChange={(e) => setStatus(e.target.value as ServiceStatus)}
          >
            {Object.values(ServiceStatus).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="currentProcess" className="block text-sm font-medium text-gray-700">
            Processo Atual
          </label>
          <select
            id="currentProcess"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={currentProcess}
            onChange={(e) => setCurrentProcess(e.target.value as ProcessStep)}
          >
            {Object.values(ProcessStep).map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="result" className="block text-sm font-medium text-gray-700">
          Resultado (Opcional)
        </label>
        <textarea
          id="result"
          rows={2}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={result}
          onChange={(e) => setResult(e.target.value)}
        ></textarea>
      </div>
      <div>
        <label htmlFor="comments" className="block text-sm font-medium text-gray-700">
          Comentários (Opcional)
        </label>
        <textarea
          id="comments"
          rows={3}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
        ></textarea>
      </div>

      {/* New: Image Upload Section */}
      <div className="border-t border-gray-200 pt-4">
        <label htmlFor="service-images" className="block text-sm font-medium text-gray-700 mb-2">
          Fotos do Serviço (Opcional)
        </label>
        <input
          type="file"
          id="service-images"
          multiple
          accept="image/*"
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
          onChange={handleImageChange}
        />
        {images.length > 0 && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((image, index) => (
              <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-200">
                <img src={image} alt={`Service image ${index + 1}`} className="w-full h-32 object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  aria-label="Remover imagem"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* End: Image Upload Section */}

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 sticky bottom-0 bg-white">
        <Button variant="secondary" type="button" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" type="submit">
          {serviceToEdit ? 'Salvar Alterações' : 'Adicionar Serviço'}
        </Button>
      </div>
    </form>
  );
};

export default ServiceForm;