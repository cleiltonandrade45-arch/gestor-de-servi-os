
import React, { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';
import { useNotifications } from '../contexts/NotificationContext';

const AuthForm: React.FC = () => {
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const { login, register, googleLogin } = useAuth();
  const { addNotification } = useNotifications();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister) {
      const success = await register(username, password, email);
      if (success) {
        addNotification('Registro bem-sucedido! Faça login.', 'success');
        setIsRegister(false); // Switch to login after successful registration
      } else {
        addNotification('Erro ao registrar. O usuário pode já existir.', 'error');
      }
    } else {
      const success = await login(username, password);
      if (success) {
        addNotification('Login bem-sucedido!', 'success');
      } else {
        addNotification('Nome de usuário ou senha incorretos.', 'error');
      }
    }
  }, [isRegister, username, password, email, login, register, addNotification]);

  const handleGoogleLogin = useCallback(async () => {
    await googleLogin();
    addNotification('Login com Google bem-sucedido!', 'success');
  }, [googleLogin, addNotification]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          {isRegister ? 'Registrar' : 'Login'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
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
          {isRegister && (
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
          )}
          <Button type="submit" variant="primary" size="lg" className="w-full">
            {isRegister ? 'Registrar' : 'Entrar'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Button
            variant="secondary"
            onClick={() => setIsRegister(!isRegister)}
            className="text-blue-600 hover:text-blue-800 focus:outline-none"
          >
            {isRegister ? 'Já tem uma conta? Faça login' : 'Não tem uma conta? Registre-se'}
          </Button>
        </div>

        <div className="relative mt-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Ou</span>
          </div>
        </div>

        <div className="mt-6">
          <Button
            variant="info"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.765-6.08 8.358-11.303 8.358-6.663 0-12.115-5.363-12.115-11.984s5.452-11.984 12.115-11.984c3.136 0 5.95 1.181 8.163 3.655l5.968-5.748C34.618 6.84 29.585 4 24 4 12.385 4 2.113 13.906 2.113 24.083s10.272 20.083 21.887 20.083c11.164 0 20.457-8.156 21.887-19.917V20.083z"/>
              <path fill="#FF3D00" d="M6.307 14.502L12.557 18.067C13.886 15.344 15.68 12.834 17.753 10.932L11.583 6.645C8.322 9.576 6.307 11.758 6.307 14.502z"/>
              <path fill="#4CAF50" d="M24 44c5.166 0 9.861-1.979 13.409-5.197L31.647 32.55c-2.383 2.11-5.69 3.447-9.647 3.447-6.045 0-11.057-4.102-12.868-9.66L6.307 33.5C9.289 39.429 16.035 44 24 44z"/>
              <path fill="#1976D2" d="M43.611 20.083V20H24v8h11.303c-1.649 4.765-6.08 8.358-11.303 8.358-6.663 0-12.115-5.363-12.115-11.984s5.452-11.984 12.115-11.984c3.136 0 5.95 1.181 8.163 3.655l5.968-5.748C34.618 6.84 29.585 4 24 4c-11.615 0-21.887 9.906-21.887 20.083S12.385 44.167 24 44.167c11.164 0 20.457-8.156 21.887-19.917V20.083z"/>
            </svg>
            <span>Continuar com Google</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
