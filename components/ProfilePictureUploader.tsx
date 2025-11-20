import React, { useState, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';
import { useNotifications } from '../contexts/NotificationContext';

interface ProfilePictureUploaderProps {
  onClose: () => void;
}

const ProfilePictureUploader: React.FC<ProfilePictureUploaderProps> = ({ onClose }) => {
  const { currentUser, updateProfilePicture } = useAuth();
  const { addNotification } = useNotifications();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // Use currentUser?.photoURL for preview, which is what Firebase Auth user object provides
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUser?.photoURL || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      // Reset preview to current user's photoURL if file is invalid
      setPreviewUrl(currentUser?.photoURL || null);
      addNotification('Por favor, selecione um arquivo de imagem válido.', 'warning');
    }
  }, [currentUser, addNotification]);

  const handleSave = useCallback(async () => {
    if (previewUrl && currentUser) {
      try {
        await updateProfilePicture(previewUrl); // Call the auth context function
        addNotification('Foto de perfil atualizada com sucesso!', 'success');
        onClose();
      } catch (error: any) {
        addNotification(`Erro ao atualizar foto de perfil: ${error.message}`, 'error');
        console.error('Error updating profile picture:', error);
      }
    } else {
      addNotification('Por favor, selecione uma imagem para salvar.', 'warning');
    }
  }, [previewUrl, currentUser, updateProfilePicture, onClose, addNotification]);

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col items-center justify-center space-y-4 mb-6">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-400 shadow-lg flex items-center justify-center bg-gray-100">
          {previewUrl ? (
            <img src={previewUrl} alt="Prévia da Foto de Perfil" className="w-full h-full object-cover" />
          ) : (
            <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          aria-label="Selecionar arquivo de imagem"
        />
        <Button variant="secondary" onClick={triggerFileInput} className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
          </svg>
          Selecionar Imagem
        </Button>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={!selectedFile && !currentUser?.photoURL}>
          Salvar
        </Button>
      </div>
    </div>
  );
};

export default ProfilePictureUploader;