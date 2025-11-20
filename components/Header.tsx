import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';

interface HeaderProps {
  onAddService: () => void;
  onOpenProfilePicModal: () => void; // New: Prop to open profile picture modal
}

// Helper to generate initials avatar URL (duplicated for component independence, but ideally shared)
const generateInitialsAvatar = (username: string) => {
  const initials = username.split(' ').map(n => n[0]).join('').toUpperCase();
  return `https://api.dicebear.com/7.x/initials/svg?seed=${initials}&chars=2`;
};

const Header: React.FC<HeaderProps> = ({ onAddService, onOpenProfilePicModal }) => {
  const { currentUser, logout } = useAuth();

  // Use currentUser.photoURL from Firebase, fallback to initials or a generic pic
  const avatarSrc = currentUser?.photoURL || (currentUser?.displayName ? generateInitialsAvatar(currentUser.displayName) : 'https://picsum.photos/40/40');


  return (
    <header className="bg-white shadow-md py-4 px-4 sm:px-6 lg:px-8 sticky top-0 z-20">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenProfilePicModal}
            className="rounded-full w-10 h-10 object-cover overflow-hidden flex items-center justify-center bg-gray-200 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Mudar foto de perfil"
          >
            {avatarSrc.startsWith('data:image') || avatarSrc.startsWith('http') ? (
              <img
                src={avatarSrc}
                alt="Avatar do Usuário"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-600 font-semibold text-sm">{currentUser?.displayName ? currentUser.displayName.substring(0, 2).toUpperCase() : '??'}</span>
            )}
          </button>
          <span className="text-lg font-medium text-gray-800 hidden sm:block">
            Bem-vindo(a), {currentUser?.displayName || 'Usuário'}!
          </span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="primary"
            onClick={onAddService}
            className="flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              ></path>
            </svg>
            <span>Adicionar Serviço</span>
          </Button>
          <Button
            variant="secondary"
            onClick={logout}
            className="flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              ></path>
            </svg>
            <span>Sair</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;