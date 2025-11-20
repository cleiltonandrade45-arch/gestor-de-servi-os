import React, { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';
import { useNotifications } from '../contexts/NotificationContext';

const AuthForm: React.FC = () => {
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [username, setUsername] = useState<string>(''); // For display name
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const { login, register, signInWithGoogle } = useAuth(); // Add signInWithGoogle
  const { addNotification } = useNotifications();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isRegister) {
        await register(email, password, username);
        addNotification('Registro bem-sucedido! Faça login.', 'success');
        setIsRegister(false); // Switch to login after successful registration
      } else {
        await login(email, password);
        addNotification('Login bem-sucedido!', 'success');
      }
    } catch (error: any) {
      addNotification(`Erro: ${error.message}`, 'error');
      console.error('Authentication error:', error);
    }
  }, [isRegister, email, password, username, login, register, addNotification]);

  const handleGoogleLogin = useCallback(async () => {
    try {
      await signInWithGoogle();
      addNotification('Login com Google bem-sucedido!', 'success');
    } catch (error: any) {
      addNotification(`Erro ao fazer login com Google: ${error.message}`, 'error');
      console.error('Google login error:', error);
    }
  }, [signInWithGoogle, addNotification]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          {isRegister ? 'Registrar' : 'Login'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          {isRegister && (
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Nome de Usuário
              </label>
              <input
                type="text"
                id="username"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              type="password"
              id="password"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" variant="primary" size="lg" className="w-full">
            {isRegister ? 'Registrar' : 'Entrar'}
          </Button>
        </form>

        <div className="mt-6 flex flex-col items-center space-y-4">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Ou</span>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.765-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 8.065 3.013l5.65-5.65C34.046 6.028 29.368 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20c11.045 0 20-8.955 20-20v-2.19c0-.629-.074-1.243-.207-1.849z" fill="#FFC107" />
              <path d="M6.306 14.691L11.758 19.33c1.378-2.618 3.371-4.707 5.795-6.248L12.483 7.82C9.288 10.428 7.026 12.448 6.306 14.691z" fill="#FF3D00" />
              <path d="M6.306 33.309C9.288 35.552 11.55 37.572 12.483 38.18L17.553 32.544c-2.424-1.541-4.417-3.63-5.795-6.248L6.306 33.309z" fill="#4CAF50" />
              <path d="M24 8c3.963 0 7.391 1.487 9.873 3.655L39.873 6C36.068 3.12 30.297 1 24 1 18.632 1 13.954 3.028 10.758 5.635L17.553 12.264C19.982 10.985 21.975 8 24 8z" fill="#1976D2" />
              <path d="M43.611 20.083L43.518 20.083L43.611 20.083z" fill="#4285F4" />
            </svg>
            Continuar com Google
          </Button>

          <Button
            variant="secondary"
            onClick={() => setIsRegister(!isRegister)}
            className="text-blue-600 hover:text-blue-800 focus:outline-none"
          >
            {isRegister ? 'Já tem uma conta? Faça login' : 'Não tem uma conta? Registre-se'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;